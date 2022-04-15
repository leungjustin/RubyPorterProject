// TODO: figure out where to declare MenuItem class, so it can be used inside of the class Navbar
class NavItem 
{
	constructor(name, link){
		this.name = name;
		this.link = link;
		this.isActive = false;
		this.nestedItems = [];
	}
}

class Navbar
{	
	constructor(){
		this.$addForm = document.getElementById("addForm");
		this.$name = document.getElementById("name");
		this.$link = document.getElementById("link");
		this.$editForm = document.getElementById("editForm");
		this.$editName = document.getElementById("editName");
		this.$editLink = document.getElementById("editLink");
		this.$editButton = document.getElementById("editButton");
		this.$deleteButton = document.getElementById("deleteButton");
		this.$enableDisableButton = document.getElementById("enableDisableButton");
		this.$addSubForm = document.getElementById("addSubForm");
		this.$addSubName = document.getElementById("addSubName");
		this.$addSubLink = document.getElementById("addSubLink");
		this.$addSubButton = document.getElementById("addSubButton");

		// fill menuItems with an array of objects that have a name, link, and isActive attribute
		this.menuItems = [			
			new NavItem('Item 1', '#item1'),
			new NavItem('Item 2', '#item2'),
			new NavItem('Item 3', '#item3'),
			new NavItem('Item 4', '#item4'),
			new NavItem('Item 5', '#item5')
		];
		this.menuItems[0].nestedItems.push(new NavItem('Nested Item 1','#nested00'));
		this.menuItems[2].nestedItems.push(new NavItem('Nested Item 1','#nested20'));
		this.menuItems[0].nestedItems[0].nestedItems.push(new NavItem('Another Level', '#nested000'));		
		this.logo = "logoideas.jpg";		
			
		console.log(this.menuItems);
		console.log(window.location.hash);
		this.bindMethods();
		this.renderNavbar();
		
		this.$addForm.onsubmit = this.addNavItem.bind(this);
	}

	bindMethods() {
		this.renderNavbar = this.renderNavbar.bind(this);	
		this.addNavItem = this.addNavItem.bind(this);		
	}
	
	renderNavbar() {
		// console.log("Render Navbar")		
		const itemsHTML = this.menuItems.map((menuItem, index) => this.renderNavItem(menuItem, index)).join(' ');		
		document.querySelector('.navbar').innerHTML = 
		`
			<img src="${this.logo}" alt="Logo">
			<ul class="itemList">${itemsHTML}</ul>
		`;
	}
	
	renderNavItem(menuItem, index) {
		// console.log("Render Nav Item " + index);						
		let nestedItemHTML = "";
		let id = `item${index}`;
		// console.log("menuItem.nestedItems has items: " + (menuItem.nestedItems.length != 0));		
		if (menuItem.nestedItems.length != 0)
		{
			nestedItemHTML = `<ul class="subnav-content">${menuItem.nestedItems.map((nestedItem, nestedItemIndex) => this.renderNestedItem(nestedItem, nestedItemIndex, id)).join(' ')}</ul>`;
		}	
					
		return `<li class="navItem"><a href="${menuItem.link}" class="${activeHash == menuItem.link ? 'active':''}" onclick="navbar.makeNavItemActive(event)">${menuItem.name}</a><button  id="${id}">E</button>${nestedItemHTML}</li>`;		
	}	

	renderNestedItem(nestedItem, nestedItemIndex, previousItemId)	{
		// console.log("Render Nested Item " + nestedItemIndex + " of Nav Item " + previousItemIndex);
		let nestedItemHTML = "";
		let id = `${previousItemId}item${nestedItemIndex}`;		
		if (nestedItem.nestedItems.length != 0)
		{
			// this is recursive
			nestedItemHTML = `<ul class="subnav-content">${nestedItem.nestedItems.map((nestedItem, nestedItemIndex) => this.renderNestedItem(nestedItem, nestedItemIndex, id)).join(' ')}</ul>`;
		}	
		
		return `<li><a href="${nestedItem.link}" class="${activeHash == nestedItem.link ? 'active':''}" onclick="navbar.makeNavItemActive(event)">${nestedItem.name}</a><button id="${id}">E</button>${nestedItemHTML}</li>`

	}
	
	makeNavItemActive(event) {		
		console.log("change active")		
		this.makeAllInactive(this.menuItems);			
		// TODO: add active class to menu item whose link matches the current window href
		// this.makeActive(this.menuItems);		
		this.renderNavbar();
	}	

	/*
	makeActive(itemArray) {
		let activeItem;
		for (let i=0; i < itemArray.length; i++)
		{
			if (window.location.hash == itemArray[i].link)
			{
				activeItem = document.querySelector(`[href='${itemArray[i].link}']`);
			}
			if (itemArray[i].nestedItems.length != 0)
			{
				this.makeActive(itemArray[i].nestedItems);
			}
		}
		if(activeItem != null)
		{
			activeItem.classList.add('active');
			console.log(activeItem)
		}		
	}
	*/

	makeAllInactive(itemArray) {
		let inactiveItem;
		for (let i=0; i < itemArray.length; i++)
		{
			inactiveItem = document.querySelector(`[href='${itemArray[i].link}']`);
			if (inactiveItem != null)
			{
				inactiveItem.classList.remove('active');
			}
			if (itemArray[i].nestedItems.length != 0)
			{
				// this is recursive
				this.makeAllInactive(itemArray[i].nestedItems);
			}		
		}	
	}

	addNavItem(event)
	{
		event.preventDefault();
		let item = new NavItem(this.$name.value, this.$link.value);
		this.menuItems.push(item);
		this.resetForms();
		this.renderNavbar();
	}
	
	addSubNavItem(event, id) {
		event.preventDefault();
		let item = new NavItem(this.$addSubName.value, this.$addSubLink.value);	
		let path = id.split('item');
		path.splice(0, 1);
		let schema = this.menuItems[path[0]];
		for (let i = 1; i < path.length; i++)
		{
			schema = schema.nestedItems[path[i]];
		}
		schema.push(item);
		this.renderNavbar();		
	}
	
	deleteNavItem() {
		
	}	

	resetForms() {
		let forms = [this.$addForm, this.$editForm, this.$addSubForm];
		forms.forEach(element => element.reset());
	}
}



let navbar;
window.onload = () => navbar = new Navbar();
var activeHash = window.location.hash;