class NavItem {
	constructor(name, link, isDisabled = false) {
		this.name = name,
		this.link = link,
		this.isActive = false, //Currently not in use. May be implemented when using data storage method.
		this.isDisabled = isDisabled, //Determines whether the item can be clicked on.
		this.subnavItems = []; //Contains an item's subitems, which are also objects of the NavItem class.
	}
}

class NavBar {
	constructor() {
		this.items = [
			new NavItem("Item1", "#item1"),
			new NavItem("Item2", "#item2"),
			new NavItem("Item3", "#item3"),
			new NavItem("Item4", "#item4"),
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

	// This method runs when the navigation style is chosen and adds a vertical or horizontal class to the navbar div.
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
		this.load();
	}

	//Renders the navbar, sets the active item if there is one, and disables all edit forms.
	load() {
		this.fillItems();
		this.changeActive(window.location.hash);
		this.addEventListeners();
		this.disableAll();
		this.resetForms();
	}

	//Same as load, expect without rendering the navbar or adding event listeners.
	reload(hash = window.location.hash) {
		this.changeActive(hash);		
		this.disableAll();
		this.resetForms();
	}

	//Changes which navbar link is active, changing its appearance.
	changeActive(hash) {
		//Removes active from all nav links, then makes the link with the matching hash active.
		this.items.forEach(item => {
			item.isActive = false;
			document.getElementById("item"+item.name).classList.remove("active");
			if (item.link == hash) {
				item.isActive = true;
				document.getElementById("item"+item.name).classList.add("active");
			}
			//Removes active from all subnav links as well, then makes the link with the matching hash and its parent item active.
			item.subnavItems.forEach(subitem => {
				subitem.isActive = false;
				document.getElementById("subitem"+subitem.name+","+item.name).classList.remove("active");
				if (subitem.link == hash) {
					item.isActive = true;
					subitem.isActive = true;
					document.getElementById("item"+item.name).classList.add("active");
					document.getElementById("subitem"+subitem.name+","+item.name).classList.add("active");
				}
			});
		});
	}

	//Fills the navbar with existing items and subitems.
	fillItems() {
		if (this.$navbar.classList.contains('vertical'))
		{
			this.$cssId.href = 'project1.css';
		}
		else if (this.$navbar.classList.contains('horizontal'))
		{
			this.$cssId.href = 'Horizontal Navbar/navbarstyles.css';
		}
		let itemsHTML = this.items.map((item) => this.renderNavItem(item)).join('');
		document.querySelector("#navbar").innerHTML = `
			<img src="${this.logo}" alt="Logo">
			${itemsHTML}
		`
	}

	//Creates a navbar item and any of its subitems, if it has any, to be placed in the navbar.
	renderNavItem(item) {
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
				let subitem = document.getElementById("subitem"+this.items[i].subnavItems[j].name+","+this.items[i].name);
				subitem.onclick = this.reload.bind(this, this.items[i].subnavItems[j].link);
				document.getElementById("subedit"+this.items[i].subnavItems[j].name+","+this.items[i].name).onclick = this.editSubnavItem.bind(this, j, i);
				subitem.ondragstart = this.dragStart;
				subitem.ondragenter = this.dragEnter;
				subitem.ondragover = this.dragOver;
				subitem.ondragleave = this.dragLeave.bind(this);
				subitem.ondragend = this.dragEnd.bind(this);
				subitem.ondrop = this.drop.bind(this);
				subitem.parameters = (j+","+i);
			}
			let item = document.getElementById("item"+this.items[i].name);
			item.onclick = this.reload.bind(this, this.items[i].link);
			document.getElementById("edit"+this.items[i].name).onclick = this.editNavItem.bind(this, i);
			item.ondragstart = this.dragStart;
			item.ondragenter = this.dragEnter;
			item.ondragover = this.dragOver;
			item.ondragleave = this.dragLeave.bind(this);
			item.ondragend = this.dragEnd.bind(this);
			item.ondrop = this.drop.bind(this);
			item.parameters = i.toString();
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
		let moveToEnd = this.items.pop();
		this.items.push(item);
		this.items.push(moveToEnd);

		//Renders the new item and adds it to the navbar.
		this.load();
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

		let editHTML = document.getElementById("item"+this.items[index].name);
		
		//Change the current item's name and/or link.
		this.items[index].name = this.$editName.value;
		this.items[index].link = this.$editLink.value;

		//Set the properties of the edited item's corresponding html element to match.
		editHTML.href = this.items[index].link;
		editHTML.id = "item"+this.items[index].name;
		editHTML.innerHTML = this.items[index].name;
		//Binds new event listener for the edited item.
		editHTML.onclick = this.reload.bind(this, this.items[index].link);

		//If the edited item is the currently active item, updates the hash so it matches the update.
		if (editHTML.classList.contains("active")) {
			window.location.hash = this.items[index].link;
		}
		this.reload();
	}

	//Removes an existing navbar item from the list.
	deleteNavItem(index) {
		if (document.getElementById("item"+this.items[index].name).classList.contains("active")) {
			window.location.hash = "";
		}
		this.items.splice(index, 1);
		this.load();
	}

	//Changes whether a navbar item is clickable or not.
	enableOrDisableLink(index) {
		if (this.items[index].isDisabled) {
			this.items[index].isDisabled = false;
			document.getElementById("item"+this.items[index].name).classList.remove("isDisabled");
		}
		else {
			this.items[index].isDisabled = true;
			document.getElementById("item"+this.items[index].name).classList.add("isDisabled");
		}
		this.reload();
	}

	//Creates a new navbar subitem based on user input and then adds it to an existing item's subitem list.
	addSubnavItem(index, event) {
		event.preventDefault();

		let subItem = new NavItem(this.$addSubName.value, this.$addSubLink.value)
		this.items[index].subnavItems.push(subItem);

		//Renders the new subitem and adds it to the navbar.
		document.getElementById("subnavContent"+this.items[index].name).innerHTML += this.renderSubnavItem(this.items[index], this.items[index].subnavItems.length-1);
		this.addEventListeners();

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

		let editHTML = document.getElementById("subitem"+this.items[parentindex].subnavItems[index].name+","+this.items[parentindex].name);

		//Change the current subitem's name and/or link.
		this.items[parentindex].subnavItems[index].name = this.$editName.value;
		this.items[parentindex].subnavItems[index].link = this.$editLink.value;

		//Set the properties of the edited subitem's corresponding html element to match.
		editHTML.href = this.items[parentindex].subnavItems[index].link;
		editHTML.id = "subitem"+this.items[parentindex].subnavItems[index].name+","+this.items[parentindex].name;
		editHTML.innerHTML = this.items[parentindex].subnavItems[index].name;
		//Binds new event listener for the edited subitem.
		editHTML.onclick = this.reload.bind(this, this.items[parentindex].subnavItems[index].link);

		//If the edited subitem is the currently active subitem, updates the hash so it match the update.
		if (editHTML.classList.contains("active")) {
			window.location.hash = this.items[parentindex].subnavItems[index].link;
		}
		this.reload();
	}

	//Removes an existing navbar subitem from a item's list.
	deleteSubnavItem(index, parentindex) {
		//If the subitem being deleted is currently active, removes the hash from the URL.
		if (document.getElementById("subitem"+this.items[parentindex].subnavItems[index].name+","+this.items[parentindex].name).classList.contains("active")) {
			window.location.hash = "";
		}

		//Removes the subitem's corresponding html from the navbar.
		document.getElementById("subnavContent"+this.items[parentindex].subnavItems[index].name+","+this.items[parentindex].name).remove();

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

	dragEnter(event) {
		event.target.classList.add("drag-over");
	}

	//This method must be called ondragover so that an event will fire ondrop
	dragOver(event) {
		event.preventDefault();
	}

	//Removes drag-over class when no longer dragging over item
	dragLeave(event) {
		event.target.classList.remove("drag-over");
	}

	//Necessary to keep subnav menus from displaying if something is dragged to an invalid drop site
	dragEnd(event) {
		event.preventDefault();
		this.load();
	}

	//Replaces navigation item dropped on with navigation item dragged
	drop(event) {		
		event.target.classList.remove("drag-over");
		let dragIndex = event.dataTransfer.getData("text/plain");		
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
}

let navbar;
window.onload = () => navbar = new NavBar();