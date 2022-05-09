class NavItem {
	constructor(id, layer, name, link, isDisabled = false) {
		this.id = id;
		this.layer = layer;
		this.name = name;
		this.link = link;
		this.isActive = false; //Currently not in use. May be implemented when using data storage method.
		this.isDisabled = isDisabled; //Determines whether the item can be clicked on.
		this.subnavItems = []; //Contains an item's subitems, which are also objects of the NavItem class.
	}
}

class NavBar {
	constructor() {
		this.items = [
			new NavItem(0, 1, "Item1", "#item1"),
			new NavItem(1, 1, "Item2", "#item2"),
			new NavItem(2, 1, "Item3", "#item3"),
			new NavItem(3, 1, "Item4", "#item4"),
			new NavItem(4, 1, "Move to end", "#")
		]; //A list of objects of the NavItem class.
		this.items[0].subnavItems.push(new NavItem(5, 2, "Move to end", "#"));
		this.items[1].subnavItems.push(new NavItem(6, 2, "Subitem1", "#subitem1"));
		this.items[1].subnavItems[0].subnavItems.push(new NavItem(7, 3, "Subsubitem1", "#subsubitem1"));
		this.items[1].subnavItems[0].subnavItems.push(new NavItem(8, 3, "Move to end", "#"));
		this.items[1].subnavItems.push(new NavItem(9, 2, "Subitem2", "#subitem2"));
		this.items[1].subnavItems[1].subnavItems.push(new NavItem(10, 3, "Subsubitem2", "#subsubitem2"));
		this.items[1].subnavItems[1].subnavItems.push(new NavItem(11, 3, "Move to end", "#"));
		this.items[1].subnavItems.push(new NavItem(12, 2, "Move to end", "#"));
		this.items[2].subnavItems.push(new NavItem(13, 2, "Subitem3", "#subitem3"));
		this.items[2].subnavItems[0].subnavItems.push(new NavItem(14, 3, "Move to end", "#"));
		this.items[2].subnavItems.push(new NavItem(15, 2, "Move to end", "#"));
		this.items[3].subnavItems.push(new NavItem(16, 2, "Move to end", "#"));

		this.lastId = 16;

		this.navStyle = "none";			
		this.logo = "RubyPorterProject/logoideas.jpg";
		
		this.$addForm = document.getElementById("addForm");
		this.$name = document.getElementById("name");
		this.$link = document.getElementById("link");
		this.$addButton = document.getElementById("addButton");
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
		this.$navbar = document.getElementById("navbar");
		this.$cssId = document.getElementById("cssId");
		this.$navStyle = document.getElementById("navStyle");
		this.$userForm = document.getElementById("userForm");
		this.$userInput = document.getElementById("userInput");		
		this.$editSettings = document.getElementById("editSettings");
		this.$addUserForm = document.getElementById("addUserForm");
		this.$addUserInput = document.getElementById("addUserInput");
		this.$deleteUserButton = document.getElementById("deleteUserButton");

    this.settings = {
			user: this.$userInput.value,
			navStyle: this.navStyle,
			items: this.items
		}

		let disabled = [
			this.$name, 
			this.$link, 
			this.$addButton, 
			this.$editName, 
			this.$editLink, 
			this.$editButton, 
			this.$deleteButton, 
			this.$enableDisableButton, 
			this.$addSubName, 
			this.$addSubLink, 
			this.$addSubButton
		];
		disabled.forEach(element => element.disabled = true);

		this.$addForm.onsubmit = this.addNavItem.bind(this, false, null);
		this.$navStyle.onchange = this.changeNavStyle.bind(this);
		this.$userForm.onsubmit = this.retrieveNavSettings.bind(this);
		this.$editSettings.onclick = this.setNavSettings.bind(this);
		this.$addUserForm.onsubmit = this.addUser.bind(this);	
		this.$deleteUserButton.onclick = this.deleteUser.bind(this);
	}

	//This method runs when the navigation style is chosen and adds a vertical or horizontal class to the navbar div.
	changeNavStyle() {
		if (this.$navStyle.value == "horizontal") {
			this.navStyle = "horizontal";
			this.$navbar.className = "navbar horizontal";
		}
		else if (this.$navStyle.value == "vertical") {
			this.navStyle = "vertical";
			this.$navbar.className = "navbar vertical";
		}
		else {
			this.navStyle = "none";
			this.$navbar.className = "navbar";
		}
		this.enableAll();
		this.load();
	}

	//Renders the navbar, sets the active item if there is one, and disables all edit forms.
	load() {		
		this.fillItems();		
		this.changeActive(this.items, window.location.hash);
		this.addEventListeners();
		this.disableAll();
		if (this.navStyle == "none") {
			this.$navbar.innerHTML = "";
			let disabled = [this.$name, this.$link, this.$addButton];
			disabled.forEach(element => element.disabled = true);
		}
		this.resetForms();
	}

	//Same as load, expect without rendering the navbar or adding event listeners.
	reload(hash = window.location.hash) {
		this.changeActive(this.items, hash);		
		this.disableAll();
		this.resetForms();
	}

	//Changes which navbar link is active, changing its appearance.
	changeActive(objectArray, hash, layer = 1) {
		objectArray.forEach(item => {
			item.isActive = false;
			let itemHTML = document.querySelector(`a[data-id="${item.id}"]`);
			itemHTML.classList.remove("active");
			if (item.link == hash) {
				item.isActive = true;
				itemHTML.classList.add("active");
				if (layer > 1) {
					let parent = itemHTML;
					for (let i = 1; i < layer; i++) {
						parent = parent.parentElement.parentElement.parentElement.childNodes[1];
						parent.classList.add("active");
					}
				}
			}
			if (item.subnavItems.length > 1) {
				this.changeActive(item.subnavItems, hash, layer + 1);
			}
		});
	}

	//Fills the navbar with existing items and subitems.
	fillItems() {
		if (this.$navbar.classList.contains("vertical")) {
			this.$cssId.href = "RubyPorterProject/project1.css";
		}
		else if (this.$navbar.classList.contains("horizontal")) {
			this.$cssId.href = "RubyPorterProject/Horizontal Navbar/navbarstyles.css";
		}
		else {
			this.$cssId.href = "";
		}
		let itemsHTML = this.items.map(item => this.renderNavItem(item)).join('');
		this.$navbar.innerHTML = `
			<img src="${this.logo}" alt="Logo">
			${itemsHTML}
		`
	}

	//Creates a navbar item and any of its subitems, if it has any, to be placed in the navbar.
	renderNavItem(item) {
		let navString = `
			<div class="subnav" ${item.name == "Move to end" ? "style='display: none;'" : ""} id="subnav" data-id="${item.id}">
				<a href="${item.link}" class="${item.isActive ? 'active' : ''} ${item.isDisabled ? 'isDisabled' : ''}" draggable="true" id="item" data-id="${item.id}">${item.name}</a>
				<button id="edit" data-id="${item.id}">E</button>
				<div class="subnav-content">
		`;
		//Each call to renderSubnavItem adds a new subitem to the navbar string.
		for (let i = 0; i < item.subnavItems.length; i++) {
			navString += this.renderNavItem(item.subnavItems[i]);
		}
		navString += `
				</div>
			</div>
		`;
		return navString;
	}

	//Adds click and submit events for navbar items and buttons.
	addEventListeners() {
		for (let i = 0; i <= this.lastId; i++) {
			let item = document.querySelector(`a[data-id="${i}"]`);
			if (item != null) {
				item.onclick = this.reload.bind(this, item.hash);
				document.querySelector(`button[data-id="${i}"]`).onclick = this.editNavItem.bind(this, i);
				item.ondragstart = this.dragStart.bind(this);
				item.ondragenter = this.dragEnter.bind(this);
				item.ondragover = this.dragOver.bind(this);
				item.ondragleave = this.dragLeave.bind(this);
				item.ondragend = this.dragEnd.bind(this);
				item.ondrop = this.drop.bind(this);
				item.parameters = i.toString();
			}
		}
	}

	//Disables all fields and buttons in all forms.
	disableAll() {
		this.$enableDisableButton.innerHTML = "Enable/Disable Link";
		let disabled = [
			this.$editName,
			this.$editLink,
			this.$editButton,
			this.$deleteButton,
			this.$enableDisableButton,
			this.$addSubName,
			this.$addSubLink,
			this.$addSubButton
		];
		disabled.forEach(element => element.disabled = true);
	}

	//Enables all fields and buttons in all forms.
	enableAll() {
		let enabled = [
			this.$name,
			this.$link,
			this.$addButton,
			this.$editName,
			this.$editLink,
			this.$editButton,
			this.$deleteButton,
			this.$enableDisableButton,
			this.$addSubName,
			this.$addSubLink,
			this.$addSubButton
		];
		enabled.forEach(element => element.disabled = false);
	}

	//Enables all fields and buttons needed to edit a navbar subitem.
	enableSub() {
		let enabled = [
			this.$editName,
			this.$editLink,
			this.$editButton,
			this.$deleteButton
		];
		enabled.forEach(element => element.disabled = false);
	}

	//Sets all fields in all forms to blank.
	resetForms() {
		let forms = [
			this.$addForm,
			this.$editForm,
			this.$addSubForm
		];
		forms.forEach(element => element.reset());
	}

	//Enables all fields and buttons and then allows to user to edit, delete, or add to an existing item.
	editNavItem(index) {
		this.disableAll();
		this.enableAll();

		let matchingItem = this.findMatchingItem(this.items, index);

		this.$editName.value = matchingItem.name;
		this.$editLink.value = matchingItem.link;

		if (matchingItem.isDisabled) {
			this.$enableDisableButton.innerHTML = "Enable Link";
		}
		else {
			this.$enableDisableButton.innerHTML = "Disable Link";
		}

		//Adds events to the buttons on each form.
		this.$editForm.onsubmit = this.submitEdit.bind(this, matchingItem, index);
		this.$deleteButton.onclick = this.deleteNavItem.bind(this, index);
		this.$enableDisableButton.onclick = this.enableOrDisableLink.bind(this, index);
		this.$addSubForm.onsubmit = this.addNavItem.bind(this, true, matchingItem);
	}

	findMatchingItem(objectArray, index) {
		for (let i = 0; i < objectArray.length; i++) {
			if (objectArray[i].id == index) {
				return objectArray[i];
			}
			if (objectArray[i].subnavItems.length > 1) {
				let matchingItem = this.findMatchingItem(objectArray[i].subnavItems, index);
				if (matchingItem != undefined) {
					return matchingItem;
				}
			}
		}
	}
	
	//Creates a new navbar item based on user input and then adds it to the item list.
	addNavItem(isSub, parentItem, event) {
		event.preventDefault();

		if (isSub == true) {
			let item = new NavItem(this.lastId+1, this.$addSubName.value, this.$addSubLink.value);
			let moveToEnd = parentItem.subnavItems.pop();
			item.subnavItems.push(new NavItem(this.lastId+2, "Move to end", "#"));
			parentItem.subnavItems.push(item);
			parentItem.subnavItems.push(moveToEnd);

			this.lastId = this.lastId + 2;
		}
		else {
			let item = new NavItem(this.lastId+1, this.$name.value, this.$link.value);
			let moveToEnd = this.items.pop();
			item.subnavItems.push(new NavItem(this.lastId+2, "Move to end", "#"));
			this.items.push(item);
			this.items.push(moveToEnd);

			this.lastId = this.lastId + 2;
		}
		this.load();
	}

	//Changes the name and/or link of an existing navbar item.
	/*
	submitEdit(index, event) {
		event.preventDefault();

		let editHTML =  document.querySelector(`a[data-id="${index}"]`);
		editHTML.innerHTML = this.$editName.value;
		editHTML.href = this.$editLink.value;
		editHTML.onclick = this.reload.bind(this, editHTML.href);
		if(editHTML.classList.contains("active")) {
			window.location.hash = editHTML.href;
		}

		let editedNav = this.createEditedNav(this.items, index);
		this.items = editedNav;

		this.reload();
	}
	*/

	submitEdit(item, index, event) {
		event.preventDefault();

		let editHTML = document.querySelector(`a[data-id="${index}"]`);
		editHTML.innerHTML = this.$editName.value;
		editHTML.href = this.$editLink.value;
		editHTML.onclick = this.reload.bind(this, editHTML.href);
		if(editHTML.classList.contains("active")) {
			window.location.hash = editHTML.href;
		}

		item.name = this.$editName.value;
		item.link = this.$editLink.value;

		this.reload();
	}

	/*
	createEditedNav(objectArray, index) {
		for (let i = 0; i < objectArray.length; i++) {
			if (objectArray[i].id == index) {
				objectArray[i].name = this.$editName.value;
				objectArray[i].link = this.$editLink.value;
			}
			if (objectArray[i].subnavItems.length > 1) {
				objectArray[i].subnavItems = this.createEditedNav(objectArray[i].subnavItems, index);
			}
		}
		return objectArray;
	}
	*/

	//Removes an existing navbar item from the list.
	deleteNavItem(index) {
		if (document.querySelector(`a[data-id="${index}"]`).classList.contains("active")) {
			window.location.hash = "";
		}

		let isDeleted = this.deleteFromParent(this.items, index);
		if (isDeleted == false) {
			this.items.splice(index, 1);
		}
		this.load();
	}

	deleteFromParent(objectArray, index) {
		for (let i = 0; i < objectArray.length; i++) {
			for (let j = 0; j < objectArray[i].subnavItems.length; j++) {
				if (objectArray[i].subnavItems[j].id == index) {
					objectArray[i].subnavItems.splice(j, 1);
					return true;
				}
			}
			if (objectArray[i].subnavItems.length > 1) {
				let isDeleted = this.deleteFromParent(objectArray[i].subnavItems, index)
				if (isDeleted == true) {
					return true;
				}
			}
		}
		return false;
	}

	//Changes whether a navbar item is clickable or not.
	enableOrDisableLink(index) {
		let matchingItem = this.findMatchingItem(this.items, index)

		if (matchingItem.isDisabled) {
			matchingItem.isDisabled = false;
			document.querySelector(`a[data-id="${index}"]`).classList.remove("isDisabled");
		}
		else {
			matchingItem.isDisabled = true;
			document.querySelector(`a[data-id="${index}"]`).classList.add("isDisabled");
		}

		this.reload();
	}

	findParent(objectArray, index) {
		for (let i = 0; i < objectArray.length; i++) {
			for (let j = 0; j < objectArray[i].subnavItems.length; j++) {
				if (objectArray[i].subnavItems[j].id == index) {
					return objectArray[i];
				}
			}
			if (objectArray[i].subnavItems.length > 1) {
				let parentItem = this.findParent(objectArray[i].subnavItems, index)
				if (parentItem != undefined) {
					return parentItem;
				}
			}
		}
	}

	//Saves the indices of a dragged nav item and displays all (most) subnav and moveToEnd items.
	dragStart(event) {				
		event.dataTransfer.setData("text/plain", event.target.parameters);
		let item = this.findMatchingItem(this.items, event.target.parameters);
		let parentItem = this.findParent(this.items, event.target.parameters);

		//This is called to work around a rendering bug in Chrome and Edge.
		setTimeout(() => {
			//If the drag item is a subitem, displays the moveToEnd item in the top level array.
			if (parentItem != undefined) {
				document.querySelector(`div[data-id="${this.items[this.items.length-1].id}"]`).style.display = "block";
			}
		}, 0);
	}

	//Add a red dashed box around the item being dragged over.
	dragEnter(event) {
		event.target.classList.add("drag-over");
		let test1 = document.querySelector(`div[data-id="${event.target.dataset.id}"]`);
		let elements = document.getElementsByClassName("subnav-content");
		for (let i = 0; i < elements.length; i++) {
			if (elements[i] != test1.parentElement.parentElement.parentElement) {
				elements[i].style.display = "none";
			}
		}
		test1.parentElement.style.display = "block";
		test1.lastElementChild.style.display = "block";
	}

	//This must be called to allow an item to trigger the drop method when dropping onto an item.
	dragOver(event) {
		event.preventDefault();
	}

	//Remove the box when item is not longer being dragged over.
	dragLeave(event) {
		event.target.classList.remove("drag-over");
	}

	//Rerenders the navbar to hide subitems in case an item is dragged to an invalid dropsite.
	dragEnd(event) {
		event.preventDefault();
		this.load();
	}

	//Removes the drag item from where it is, then places it in the correct location.
	drop(event) {		
		event.target.classList.remove("drag-over");
		let dragIndex = event.dataTransfer.getData("text/plain");		
		let dragArray = dragIndex.split(",");
		let dropIndex = event.target.parameters;
		let dropArray = dropIndex.split(",");
		let dragVar;

		//If the drop item is the child of the drag item, do nothing (e.g. An item can't be dropped onto one of its own subitems).
		if (!(dragArray.length == 1 && dropArray.length == 2 && dragArray[0] == dropArray[1])) {
			//If the drag item is a top level item, splice it from the items array.
			if (dragArray.length == 1) {
				dragVar = this.items[dragArray[0]];
				this.items.splice(dragArray[0], 1);
			}
			//Otherwise (i.e. If the drag item is a subitem), splice it from the parent item's array.
			else {
				dragVar = this.items[dragArray[1]].subnavItems[dragArray[0]];
				this.items[dragArray[1]].subnavItems.splice(dragArray[0], 1);
			}

			//If the drop item is a top level item, simply place the drag item back into the items array.
			if (dropArray.length == 1) {
				//Also if the drag item is a subitem, add a moveToEnd item to it before putting it back into the array.
				if (dragArray.length != 1) {
					dragVar.subnavItems.push(new NavItem("Move to end", "#"));
				}
				this.items.splice(dropArray[0], 0, dragVar);
			}
			//Otherwise (i.e. If the drop item is a subitem)...
			else {
				dragVar.subnavItems.pop();
				//Both of the following statements are for if a top level item is being placed into another item's subitems.
				//The first is for if the drag item was before the drop item's parent in the array.
				if (dragArray.length == 1 && dragArray[0] < dropArray[1]) {
					this.items[dropArray[1]-1].subnavItems.splice(dropArray[0], 0, dragVar);
				}
				//The second is for if the drag item was after the drop item's parent in the array.
				else {
					this.items[dropArray[1]].subnavItems.splice(dropArray[0], 0, dragVar);
				}
			}
		}
		
		this.load();
	}

	//Retrieve navigation items and navigation bar style based on user
	retrieveNavSettings(event) {
		event.preventDefault();		
		fetch(`http://justin.navigation.test/userdata?${this.$userInput.value}`)
		.then(response => response.json())
		.then(data => {
			if (data) {
				this.items = data.items;
				this.$navStyle.value = data.navStyle;
				this.navStyle = data.navStyle;				
			}
			else {
				this.items = [];
				this.$navStyle.value = "";
				this.navStyle = 'none';
				console.log("User doesn't exist");
			}
			this.changeNavStyle();
			console.log(data);
		})
		.catch(error => {
			console.log("There was a problem getting user settings.");
			this.disableAll();
		})
	}

	//Sets navigation items and navigation bar style	
	setNavSettings(event) {
		event.preventDefault();
		let users = [];
		let isValid = false;
		let userCounter = 0;
		this.settings = {
			user: this.$userInput.value,
			navStyle: this.navStyle,
			items: this.items
		}
		fetch('http://justin.navigation.test/users')
		.then(response => response.json())
		.then(data => {
			users = data;
			console.log(users);
			//Check to make sure valid user is entered in $userInput
			while(isValid == false && userCounter < users.length) {
				if (users[userCounter].user == this.$userInput.value) {
					isValid = true;
				}
				userCounter++;
			}

			if (isValid) {
				fetch("http://justin.navigation.test/edit" , {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(this.settings),
				})
				.then(response => response.json())
				.then(data => {
					console.log("Success", data);
				})
				.catch(error => {
					console.error("Error", error);
				});
			}
		})
		.catch(error => {
			console.log("Could not get user data.");
		})				
	}	

	// Adds a user to the files on the webserver
	addUser(event) {		
		event.preventDefault();
		console.log("addUser firing");
		let users = [];
		let isInvalid = false;
		let userCounter = 0;
		this.settings = {
			user: this.$addUserInput.value,
			navStyle: 'none',
			items: [new NavItem(0, 1,"Move to end", "#")]
		}
		fetch('http://justin.navigation.test/users')
		.then(response => response.json())
		.then(data => {
			users = data;
			console.log(users);
			//Check to make sure user in $addUserInput is not invalid
			while(isInvalid == false && userCounter < users.length)
			{
				if (users[userCounter].user == this.$addUserInput.value)
				{
					isInvalid = true;
					console.log("User already exists");
				}
				userCounter++;
			}
			if (this.$addUserInput.value == "")
			{
				isInvalid = true;
				console.log("User is blank");
			}

			if (!isInvalid)
			{
				fetch('http://justin.navigation.test/adduser' , {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(this.settings),
				})
				.then(response => response.json())
				.then(data => {
					console.log('Success', data);
				})
				.catch(error => {
					console.error('Error', error);
				});
			}
		})
		.catch(error => {
			console.log("Could not get user data.");
		})		
	}

	// Deletes user from files on the webserver
	deleteUser(event) {
		event.preventDefault();
		console.log("deleteUser firing");
		let users = [];
		let isValid = false;
		let userCounter = 0;
		this.settings = {
			user: this.$addUserInput.value,
			navStyle: 'none',
			items: []
		}
		fetch('http://justin.navigation.test/users')
		.then(response => response.json())
		.then(data => {
			users = data;
			console.log(users);
			//Check to make sure valid user is entered in $addUserInput
			while(isValid == false && userCounter < users.length && this.$addUserInput.value != "")
			{
				if (users[userCounter].user == this.$addUserInput.value)
				{
					isValid = true;
				}
				userCounter++;
			}

			if (isValid)
			{
				fetch('http://justin.navigation.test/deleteuser' , {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(this.settings),
				})
				.then(response => response.json())
				.then(data => {
					console.log('Success', data);
				})
				.catch(error => {
					console.error('Error', error);
				});
			}
		})
		.catch(error => {
			console.log("Could not get user data.");
		})				
	}
	
}

let navbar;
window.onload = () => navbar = new NavBar();
