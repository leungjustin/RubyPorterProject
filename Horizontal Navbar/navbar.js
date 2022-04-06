class NavItem {
	constructor(name, link) {
		this.name = name,
		this.link = link,
		this.isActive = false, //Item changes color based on this property.
		this.isDisabled = false, //Determines whether the item can be clicked on.
		this.subnavItems = []; //Contains an item's subitems, which are also objects of the NavItem class.
	}
}

class NavBar {
	constructor() {
		this.items = []; //A list of objects of the NavItem class.
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

		this.$addForm.onsubmit = this.addNavItem.bind(this);

		this.reload();
	}

	//Essentially redraws the navbar and resets forms.
	reload() {
		this.fillItems();
		this.addEventListeners();
		this.disableAll();
		this.resetForms();
	}

	//Fills the navbar with existing items and subitems.
	fillItems() {
		let itemsHTML = `<div class="logo">Logo</div>`;
		//Each call to renderNavItem adds a new item to the navbar string.
		itemsHTML += this.items.reduce(
			(html, item, index) => html += this.renderNavItem(item, index), '');
			
		document.getElementById("navbar").innerHTML = itemsHTML;
	}

	//Creates a navbar item and any of its subitems, if it has any, to be placed in the navbar.
	renderNavItem(item, index) {
		//If the item has no subitems, create and return this string.
		if (item.subnavItems == null) {
			return `
				<a href="${item.link}" class="${item.isActive ? 'active' : ''} ${item.isDisabled ? 'isDisabled' : ''}" id="item${index}">${item.name}</a>
				<button id="edit${index}">E</button>
				`;
		}
		//If the item does have subitems, create and return this string instead.
		else {
			let navString = `
				<div class="subnav">
					<a href="${item.link}" class="${item.isActive ? 'active' : ''} ${item.isDisabled ? 'isDisabled' : ''}" id="item${index}">${item.name}</a>
					<button id="edit${index}">E</button>
					<div class="subnav-content">
			`;
			//Creates a string for each subitem.
			for (let i = 0; i < item.subnavItems.length; i++) {
				navString += `
					<div>
						<a href="${item.subnavItems[i].link}" ${item.subnavItems[i].isActive ? 'class="active"' : ''} id="subitem${i},${index}">${item.subnavItems[i].name}</a>
						<button id="subedit${i},${index}">E</button>
					</div>
				`;
			}
			navString += `
					</div>
				</div>
			`;
			return navString;
		}
	}

	//Adds click and submit events for navbar items and buttons.
	addEventListeners() {
		//Adds events to each navbar item.
		for (let i = 0; i < this.items.length; i++) {
			//Adds events to each item's subitems, if it has any.
			for (let j = 0; j < this.items[i].subnavItems.length; j++) {
				document.getElementById("subitem"+j+","+i).onclick = this.changeActive.bind(this, "subitem", j, i);
				document.getElementById("subedit"+j+","+i).onclick = this.editSubnavItem.bind(this, j, i);
			}
			document.getElementById("item"+i).onclick = this.changeActive.bind(this, "item", i);
			document.getElementById("edit"+i).onclick = this.editNavItem.bind(this, i);
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

	//Changes which navbar item or subitem is the active.
	changeActive(string, index, parentindex = -1) {
		//Sets the active property of all items and subitems to false.
		this.items.forEach(item => {
			item.isActive = false;
			item.subnavItems.forEach(subItem => subItem.isActive = false);
		});
		//Sets the item or subitem that was clicked on to be active. If statements are to check whether an item was clicked or a subitem was clicked.
		if (string == "item") {
			this.items[index].isActive = true;
		}
		if (string == "subitem") {
			this.items[parentindex].subnavItems[index].isActive = true;
		}
		this.reload();
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
		this.reload();
	}

	//Removes an existing navbar item from the list.
	deleteNavItem(index) {
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
		this.reload();
	}

	//Removes an existing navbar subitem from a item's list.
	deleteSubnavItem(index, parentindex) {
		this.items[parentindex].subnavItems.splice(index, 1);
		this.reload();
	}
}

new NavBar();