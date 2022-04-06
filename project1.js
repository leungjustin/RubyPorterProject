// TODO: figure out where to declare MenuItem class, so it can be used inside of the class Navbar
class MenuItem 
{
	constructor(name, link, isActive){
		this.name = name;
		this.link = link;
		this.isActive = isActive;
		this.nestedItems = [];
	}
}

class Navbar
{	
	constructor(){
		
		// fill menuItems with an array of objects that have a name, link, and isActive attribute
		this.menuItems = [			
			new MenuItem('Item 1', '#item1', true),
			new MenuItem('Item 2', '#item2', false),
			new MenuItem('Item 3', '#item3', false),
			new MenuItem('Item 4', '#item4', false),
			new MenuItem('Item 5', '#item5', false)
		];
		this.menuItems[0].nestedItems.push(new MenuItem('Nested Item 1','#nested00', false));
		this.menuItems[2].nestedItems.push(new MenuItem('Nested Item 1','#nested20', false));
		this.menuItems[0].nestedItems[0].nestedItems.push(new MenuItem('Another Level', '#nested000', false));		
		this.logo = "logoideas.jpg";		
			
		console.log(this.menuItems);
		console.log(window.location.hash);
		this.bindMethods();
		this.renderNavbar();
	}

	bindMethods() {
		this.renderNavbar = this.renderNavbar.bind(this);
		this.renderNavItem = this.renderNavItem.bind(this);		
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
		// console.log("menuItem.nestedItems has items: " + (menuItem.nestedItems.length != 0));		
		if (menuItem.nestedItems.length != 0)
		{
			nestedItemHTML = `<ul class="subnav-content">${menuItem.nestedItems.map((nestedItem, nestedItemIndex) => this.renderNestedItem(nestedItem, nestedItemIndex, index)).join(' ')}</ul>`;
		}		
		return `<li class="navItem"><a href="${menuItem.link}" class="${activeHash == menuItem.link ? 'active':''}" onclick="navbar.makeNavItemActive(event)">${menuItem.name}</a>${nestedItemHTML}</li>`;		
	}	

	renderNestedItem(nestedItem, nestedItemIndex, previousItemIndex)	{
		// console.log("Render Nested Item " + nestedItemIndex + " of Nav Item " + previousItemIndex);
		let nestedItemHTML = "";		
		if (nestedItem.nestedItems.length != 0)
		{
			// this is recursive
			nestedItemHTML = `<ul class="subnav-content">${nestedItem.nestedItems.map((nestedItem, nestedItemIndex) => this.renderNestedItem(nestedItem, nestedItemIndex, previousItemIndex)).join(' ')}</ul>`;
		}
		return `<li><a href="${nestedItem.link}" class="${activeHash == nestedItem.link ? 'active':''}" onclick="navbar.makeNavItemActive(event)">${nestedItem.name}</a>${nestedItemHTML}</li>`

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
	
	addNavItem() {		
		
	}
	
	deleteNavItem() {
		
	}	
}



let navbar;
window.onload = () => navbar = new Navbar();
var activeHash = window.location.hash;