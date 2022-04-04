class Navbar
{	
	constructor(){
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
		// fill menuItems with an array of objects that have a name, link, and isActive attribute
		this.menuItems = [			
			new MenuItem('Item 1', '#', true),
			new MenuItem('Item 2', '#', false),
			new MenuItem('Item 3', '#', false),
			new MenuItem('Item 4', '#', false),
			new MenuItem('Item 5', '#', false)
		];
		this.menuItems[0].nestedItems.push(new MenuItem('Nested Item 1','#', false));
		this.menuItems[2].nestedItems.push(new MenuItem('Nested Item 1','/', false));
		this.menuItems[0].nestedItems[0].nestedItems.push(new MenuItem('Another Level', '#', false));		
		this.logo = "logoideas.jpg";
		// attempting to figure out how to get nested menu items to be active
		this.activeTree = [0];
		
		console.log(this.menuItems);
		this.bindMethods();
		this.renderNavbar();
	}

	bindMethods() {
		this.renderNavbar = this.renderNavbar.bind(this);
		this.renderNavItem = this.renderNavItem.bind(this);		
	}
	
	renderNavbar() {
		console.log("Render Navbar")		
		const itemsHTML = this.menuItems.map((menuItem, index) => this.renderNavItem(menuItem, index)).join(' ');		
		document.querySelector('.navbar').innerHTML = 
		`
			<img src="${this.logo}" alt="Logo">
			<ul class="itemList">${itemsHTML}</ul>
		`;
	}
	
	renderNavItem(menuItem, index) {
		console.log("Render Nav Item " + index);						
		let nestedItemHTML = "";
		console.log("menuItem.nestedItems has items: " + (menuItem.nestedItems.length != 0));		
		if (menuItem.nestedItems.length != 0 && menuItem.isActive == true)
		{
			nestedItemHTML = `<ul>${menuItem.nestedItems.map((nestedItem, nestedItemIndex) => this.renderNestedItem(nestedItem, nestedItemIndex, index)).join(' ')}</ul>`;
		}		
		return `<li><a href="${menuItem.link}" class="${menuItem.isActive ? 'active':''}" onclick="navbar.makeNavItemActive(event,${index})">${menuItem.name}</a>${nestedItemHTML}</li>`;		
	}	

	renderNestedItem(nestedItem, nestedItemIndex, previousItemIndex)	{
		console.log("Render Nested Item " + nestedItemIndex + " of Nav Item " + previousItemIndex);
		let nestedItemHTML = "";		
		if (nestedItem.nestedItems.length != 0)
		{
			// this is recursive
			nestedItemHTML = `<ul>${nestedItem.nestedItems.map((nestedItem, nestedItemIndex) => this.renderNestedItem(nestedItem, nestedItemIndex, previousItemIndex)).join(' ')}</ul>`;
		}
		return `<li><a href="${nestedItem.link}" class="${nestedItem.isActive ? 'active':''}">${nestedItem.name}</a>${nestedItemHTML}</li>`

	}
	
	makeNavItemActive(event, index) {		
		console.log("change active")		
		this.makeAllInactive(this.menuItems);
		console.log(this.menuItems);
		// TODO: change this so that it changes isActive to true for all the menu items in this.activeTree. Or rethink this strategy
		this.menuItems[index].isActive = true;
		this.renderNavbar();
	}	

	makeAllInactive(itemArray) {
		for (let i=0; i < itemArray.length; i++)
		{
			itemArray[i].isActive = false;
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