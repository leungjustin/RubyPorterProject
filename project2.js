class NavItem {
	constructor(name, link) {
		this.name = name,
		this.link = link,
		this.isDisabled = false, //Determines whether the item can be clicked on.
		this.isActive = false,
		this.subnavItems = []; //Contains an item's subitems, which are also objects of the NavItem class.
	}
}

class NavBar {
	constructor() {
		this.items = [
			new NavItem("Item1", "#item1"),
			new NavItem("Item2", "#item2"),
			new NavItem("Item3", "#item3"),
			new NavItem("Move to end", "#")
		]; //A list of objects of the NavItem class.
		this.items[1].subnavItems.push(new NavItem("Subitem1", "#subitem1"));
		this.items[1].subnavItems.push(new NavItem("Subitem2", "#subitem2"));
		
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
		this.$navbar = document.getElementById('navbar');
		this.$cssId = document.getElementById('cssId');
		this.$navStyle = document.getElementById('navStyle');

        this.logo = "logoideas.jpg";

		this.$addForm.onsubmit = this.addNavItem.bind(this);		
		this.$navStyle.onchange = this.changeNavStyle.bind(this);		
	}

	//Essentially redraws the navbar and resets forms.
	reload(hash = window.location.hash) {
		this.changeActive(hash);
		this.fillItems();
		this.addEventListeners();
		this.disableAll();
		this.resetForms();
	}

	changeActive(hash) {
		this.items.forEach(item => {
			item.isActive = false;
			if (item.link == hash) {
				item.isActive = true;
			}
			item.subnavItems.forEach(subitem => {
				subitem.isActive = false;
				if (subitem.link == hash) {
					item.isActive = true;
					subitem.isActive = true;
				}
			});
		});
	}

	//Fills the navbar with existing items and subitems.
	fillItems() {
		if (this.$navbar.classList.contains('vertical'))
		{
			this.$cssId.href = 'project1.css';
			const itemsHTML = this.items.map((menuItem) => this.renderNavItem(menuItem)).join(' ');
			document.querySelector('#navbar').innerHTML = 
			`
				<img src="${this.logo}" alt="Logo">
				<ul class="itemList">${itemsHTML}</ul>
			`;


		}
		else if (this.$navbar.classList.contains('horizontal'))
		{
			this.$cssId.href = 'navbarstyles.css';
			let itemsHTML = `<div class="logo">Logo</div>`;
			//Each call to renderNavItem adds a new item to the navbar string.
			itemsHTML += this.items.reduce((html, item) => html += this.renderNavItem(item), '');
			document.getElementById("navbar").innerHTML = itemsHTML;

		}
	}

	//Creates a navbar item and any of its subitems, if it has any, to be placed in the navbar.
	renderNavItem(item) {
		
		if (this.$navbar.classList.contains('vertical'))
		{
			let navString = `
				<li class="subnav" id="subnav${item.name}">
					<a href="${item.link}" class="${item.isActive ? 'active' : ''} ${item.isDisabled ? 'isDisabled' : ''}" draggable="true" id="item${item.name}">${item.name}</a>
					<button id="edit${item.name}">E</button>
					<ul class="subnav-content">
			`;
			//Creates a string for each subitem.
			for (let i = 0; i < item.subnavItems.length; i++) {
				navString += `
					<li id="subnavContent${item.subnavItems[i].name},${item.name}">
						<a href="${item.subnavItems[i].link}" ${item.subnavItems[i].isActive ? 'class="active"' : ''} draggable="true" id="subitem${item.subnavItems[i].name},${item.name}">${item.subnavItems[i].name}</a>
						<button id="subedit${item.subnavItems[i].name},${item.name}">E</button>
					</li>
				`;
			}
			navString += `
					</ul>
				</li>
			`;
			return navString;
		}
		else if (this.$navbar.classList.contains('horizontal'))
		{
			let navString = `
				<div class="subnav" ${item.name == "Move to end" ? "style='display: none;'" : ""} id="subnav${item.name}">
					<a href="${item.link}" class="${item.isActive ? 'active' : ''} ${item.isDisabled ? 'isDisabled' : ''}" draggable="true" id="item${item.name}">${item.name}</a>
					<button id="edit${item.name}">E</button>
					<div class="subnav-content" id="subnavContent${item.name}">
				`;
			//Each call to renderSubnavItem adds a new subitem to the navbar string.
			for (let i = 0; i < item.subnavItems.length; i++) {
				navString += this.renderSubnavItem(item, i);
			}
			navString += `
					</div>
				</div>
			`;
			return navString;
		}
	}

	//Creates a subnav item to be placed within an item for the horizontal navigation bar.
	renderSubnavItem(item, i) {
		return `
			<div id="subnavContent${item.subnavItems[i].name},${item.name}">
				<a href="${item.subnavItems[i].link}" ${item.subnavItems[i].isActive ? 'class="active"' : ''} draggable="true" id="subitem${item.subnavItems[i].name},${item.name}">${item.subnavItems[i].name}</a>
				<button id="subedit${item.subnavItems[i].name},${item.name}">E</button>
			</div>
		`;
	}


	//Adds click and submit events for navbar items and buttons.
	addEventListeners() {		
		//Adds events to each navbar item.
		for (let i = 0; i < this.items.length; i++) {
			//Adds events to each item's subitems, if it has any.
			for (let j = 0; j < this.items[i].subnavItems.length; j++) {
				let subitemElem = document.getElementById("subitem"+this.items[i].subnavItems[j].name+","+this.items[i].name);
				subitemElem.onclick = this.reload.bind(this, this.items[i].subnavItems[j].link);
				document.getElementById("subedit"+this.items[i].subnavItems[j].name+","+this.items[i].name).onclick = this.editSubnavItem.bind(this, j, i);
				subitemElem.ondragstart = this.dragStart;
				subitemElem.ondragover = this.dragOver;
				subitemElem.ondrop = this.drop.bind(this);
				subitemElem.ondragleave = this.dragLeave.bind(this);
				subitemElem.ondragend = this.dragEnd.bind(this);
				subitemElem.parameters = (j+","+i);
			}
			
			let itemElem = document.getElementById("item"+this.items[i].name);
			itemElem.onclick = this.reload.bind(this, this.items[i].link);
			document.getElementById("edit"+this.items[i].name).onclick = this.editNavItem.bind(this, i);
			itemElem.ondragstart = this.dragStart;
			itemElem.ondragover = this.dragOver;
			itemElem.ondrop = this.drop.bind(this);
			itemElem.ondragleave = this.dragLeave.bind(this);
			itemElem.ondragend = this.dragEnd.bind(this);
			itemElem.parameters = i.toString();
		}

	}

	//Disables all fields and buttons in all forms.
	disableAll() {
		this.$enableDisableButton.innerHTML = "Enable/Disable Link";
		let disabled = [this.$editName, this.$editLink, this.$editButton, this.$deleteButton, this.$enableDisableButton, this.$addSubName, this.$addSubLink, this.$addSubButton];
		disabled.forEach(element => element.disabled = true);
	}

	//Enables all fields and buttons in all forms.
	enableAll() {
		let enabled = [this.$editName, this.$editLink, this.$editButton, this.$deleteButton, this.$enableDisableButton, this.$addSubName, this.$addSubLink, this.$addSubButton];
		enabled.forEach(element => element.disabled = false);
	}

	//Enables all fields and buttons needed to edit a navbar subitem.
	enableSub() {
		let enabled = [this.$editName, this.$editLink, this.$editButton, this.$deleteButton];
		enabled.forEach(element => element.disabled = false);
	}

	//Sets all fields in all forms to blank.
	resetForms() {
		let forms = [this.$addForm, this.$editForm, this.$addSubForm];
		forms.forEach(element => element.reset());
	}
	
	//Creates a new navbar item based on user input and then adds it to the item list.
	addNavItem(event) {
		event.preventDefault();
		let item = new NavItem(this.$name.value, this.$link.value);
		this.items.push(item);
		this.reload();
	}

	//Enables all fields and buttons and then allows to user to edit, delete, or add to an existing item.
	editNavItem(index) {
		this.disableAll();
		this.enableAll();
		//Sets the text fields to what the item's name and link are currently.
		this.$editName.value = this.items[index].name;
		this.$editLink.value = this.items[index].link;

		//Changes the text of the enable/disable button depending on whether the current item is disabled.
		if (this.items[index].isDisabled) {
			this.$enableDisableButton.innerHTML = "Enable Link";
		}
		else {
			this.$enableDisableButton.innerHTML = "Disable Link";
		}

		//Adds events to the buttons on each form.
		this.$editForm.onsubmit = this.submitEdit.bind(this, index);
		this.$deleteButton.onclick = this.deleteNavItem.bind(this, index);
		this.$enableDisableButton.onclick = this.enableOrDisableLink.bind(this, index);
		this.$addSubForm.onsubmit = this.addSubnavItem.bind(this, index);
	}

	//Changes the name and/or link of an existing navbar item.
	submitEdit(index, event) {
		event.preventDefault();
		this.items[index].name = this.$editName.value;
		this.items[index].link = this.$editLink.value;
		if (this.items[index].isActive) {
			window.location.hash = this.items[index].link;
		}
		this.reload();
	}

	//Removes an existing navbar item from the list.
	deleteNavItem(index) {
		if (this.items[index].isActive) {
			window.location.hash = "";
		}
		this.items.splice(index, 1);
		this.reload();
	}

	//Changes whether a navbar item is clickable or not.
	enableOrDisableLink(index) {
		if (this.items[index].isDisabled) {
			this.items[index].isDisabled = false;
		}
		else {
			this.items[index].isDisabled = true;
		}
		this.reload();
	}

	//Creates a new navbar subitem based on user input and then adds it to an existing item's subitem list.
	addSubnavItem(index, event) {
		event.preventDefault();
		let subItem = new NavItem(this.$addSubName.value, this.$addSubLink.value)
		this.items[index].subnavItems.push(subItem);
		this.reload();
	}

	//Enables certain fields and buttons and then allows to user to edit, delete, or add to an existing subitem.
	editSubnavItem(index, parentindex) {
		this.disableAll();
		this.enableSub();
		//Sets the text fields to what the subitem's name and link are currently.
		this.$editName.value = this.items[parentindex].subnavItems[index].name;
		this.$editLink.value = this.items[parentindex].subnavItems[index].link;
		
		//Adds events to the buttons on the edit form.
		this.$editForm.onsubmit = this.submitSubEdit.bind(this, index, parentindex);
		this.$deleteButton.onclick = this.deleteSubnavItem.bind(this, index, parentindex);
	}

	//Changes the name and/or link of an existing navbar subitem.
	submitSubEdit(index, parentindex, event) {
		event.preventDefault();
		this.items[parentindex].subnavItems[index].name = this.$editName.value;
		this.items[parentindex].subnavItems[index].link = this.$editLink.value;
		if (this.items[parentindex].subnavItems[index].isActive) {
			window.location.hash = this.items[parentindex].subnavItems[index].link;		
		}
		this.reload();
	}

	//Removes an existing navbar subitem from a item's list.
	deleteSubnavItem(index, parentindex) {
		if (this.items[parentindex].subnavItems[index].isActive) {
			window.location.hash = "";
		}
		this.items[parentindex].subnavItems.splice(index, 1);
		this.reload();
	}

	//Saves the indexes of a dragged menu item and displays all subnavigation items
	dragStart(event) {
		event.dataTransfer.setData("text/plain", event.target.parameters);
		let dragIndex = event.target.parameters;
		let dragArray = dragIndex.split(",");
		if (dragArray.length != 1) {
			document.getElementById("subnavMove to end").style.display = "block";
		}
		let subnavArray = document.getElementsByClassName("subnav-content");
		for (let i = 0; i < subnavArray.length; i++) {
			subnavArray[i].style.display = "block";
		}
	}

	//This method must be called ondragover so that an event will fire ondrop
	dragOver(event) {
		event.preventDefault();
		event.target.classList.add("drag-over");
	}

	//Removes drag-over class when no longer dragging over item
	dragLeave(event) {
		event.target.classList.remove("drag-over");
	}

	//Necessary to keep subnav menus from displaying if something is dragged to an invalid drop site
	dragEnd(event) {
		event.preventDefault();
		this.reload();
	}

	//Replaces navigation item dropped on with navigation item dragged
	drop(event) {
		event.target.classList.remove("drag-over");
		let dragIndex = event.dataTransfer.getData("text/plain");
		event.dataTransfer.clearData();
		let dragArray = dragIndex.split(",");
		let dropIndex = event.target.parameters;
		let dropArray = dropIndex.split(",");
		let dragVar;

		if (!(dragArray.length == 1 && dropArray.length == 2 && dragArray[0] == dropArray[1])) {
			if (dragArray.length == 1) {
				dragVar = this.items[dragArray[0]];
				this.items.splice(dragArray[0], 1);
			}
			else {
				dragVar = this.items[dragArray[1]].subnavItems[dragArray[0]];
				this.items[dragArray[1]].subnavItems.splice(dragArray[0], 1);
			}

			if (dropArray.length == 1) {
				this.items.splice(dropArray[0], 0, dragVar);
			}
			else if (dragArray.length == 1 && dragArray[0] < dropArray[1]) {
				this.items[dropArray[1]-1].subnavItems.splice(dropArray[0], 0, dragVar);
			}
			else {
				this.items[dropArray[1]].subnavItems.splice(dropArray[0], 0, dragVar);
			}
		}
		
		this.reload();
	}

	// This method runs when the navigation style is chosen and adds a vertical or horizontal class to the navbar div
	changeNavStyle() {
		if (this.$navStyle.value == 'horizontal')
		{
			this.$navbar.className = 'navbar horizontal';			
		}
		else if (this.$navStyle.value == 'vertical')
		{
			this.$navbar.className = 'navbar vertical';
		}
		else 
		{
			this.$navbar.className = 'navbar';
		}
		this.reload();
	}

}

let navbar;
window.onload = () => navbar = new NavBar();