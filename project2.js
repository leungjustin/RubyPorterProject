class NavItem {
	constructor(id, parentId, layer, name, link, isDisabled = false) {
		this.id = id;
		this.parentId = parentId;
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
			new NavItem(0, -1, 1, "Item1", "#item1"),
			new NavItem(1, -1, 1, "Item2", "#item2"),
			new NavItem(2, -1, 1, "Item3", "#item3"),
			new NavItem(3, -1, 1, "Item4", "#item4"),
			new NavItem(4, -1, 1, "Move to end", "#")
		];
		this.items[0].subnavItems.push(new NavItem(5, 0, 2, "Move to end", "#"));
		this.items[1].subnavItems.push(new NavItem(6, 1, 2, "Subitem1", "#subitem1"));
		this.items[1].subnavItems[0].subnavItems.push(new NavItem(7, 6, 3, "Subsubitem1", "#subsubitem1"));
		this.items[1].subnavItems[0].subnavItems.push(new NavItem(8, 6, 3, "Move to end", "#"));
		this.items[1].subnavItems.push(new NavItem(9, 1, 2, "Subitem2", "#subitem2"));
		this.items[1].subnavItems[1].subnavItems.push(new NavItem(10, 9, 3, "Subsubitem2", "#subsubitem2"));
		this.items[1].subnavItems[1].subnavItems.push(new NavItem(11, 9, 3, "Move to end", "#"));
		this.items[1].subnavItems.push(new NavItem(12, 1, 2, "Move to end", "#"));
		this.items[2].subnavItems.push(new NavItem(13, 2, 2, "Subitem3", "#subitem3"));
		this.items[2].subnavItems[0].subnavItems.push(new NavItem(14, 13, 3, "Move to end", "#"));
		this.items[2].subnavItems.push(new NavItem(15, 2, 2, "Move to end", "#"));
		this.items[3].subnavItems.push(new NavItem(16, 3, 2, "Move to end", "#"));

		this.lastId = 16;

		this.navStyle = "none";			
		this.logo = "logoideas.jpg";
		
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
			items: this.items,
			lastId: this.lastId
		}

		this.disableAll();
		let disabled = [
			this.$name,
			this.$link,
			this.$addButton
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

	//Calls many other methods in order to properly render the navbar and set all forms to default.
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

	//Changes which navbar link is active, which changes its appearance.
	//The method set each nav item in the array (starting with this.items) to not active, then checks if its link property is equal to the hash.
	//If it is, the item is set to active. If the item is nested, the item's parents are also set to active.
	//Finally, if the item has nested items in it, the method is called again on those items.
	changeActive(objectArray, hash) {
		objectArray.forEach(item => {
			item.isActive = false;
			let itemHTML = document.querySelector(`a[data-id="${item.id}"]`);
			itemHTML.classList.remove("active");
			if (item.link == hash) {
				item.isActive = true;
				itemHTML.classList.add("active");
				if (item.parentId != -1) {
					let parent = itemHTML;
					for (let i = 1; i < item.layer; i++) {
						parent = parent.parentElement.parentElement.parentElement.childNodes[1];
						parent.classList.add("active");
					}
				}
			}
			if (item.subnavItems.length > 1) {
				this.changeActive(item.subnavItems, hash);
			}
		});
	}

	//Sets the css file that will be used based on user settings, then calls renderNavItem to generate the navbar html.
	fillItems() {
		if (this.$navbar.classList.contains("vertical")) {
			this.$cssId.href = "project1.css";
		}
		else if (this.$navbar.classList.contains("horizontal")) {
			this.$cssId.href = "Horizontal Navbar/navbarstyles.css";
		}
		else {
			this.$cssId.href = "";
		}
		let itemsHTML = this.items.map(item => this.renderNavItem(item)).join(''); //Generates html for each navbar item, then joins them all together.
		this.$navbar.innerHTML = `
			<img src="${this.logo}" alt="Logo">
			${itemsHTML}
		`
	}

	//Creates the html for a single navbar item. If the item has nested item in it, the method is called again on each of the nested items.
	renderNavItem(item) {
		let navString = `
			<div class="subnav ${item.name == 'Move to end' ? 'move-to-end' : ''}" ${item.name == "Move to end" ? "style='display: none;'" : ""} data-id="${item.id}">
				<a href="${item.link}" class="${item.isActive ? 'active' : ''} ${item.isDisabled ? 'isDisabled' : ''}" draggable="true" data-id="${item.id}">${item.name}</a>
				<button data-id="${item.id}">E</button>
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

	//Disables all fields and buttons in all forms, except the add form.
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
	//The maximum amount of nesting for this app is 3 layers, so if the item being edited is in layer 3, the add sub form is disabled so the user can't add a 4th layer of nesting.
	editNavItem(index) {
		this.disableAll();
		this.enableAll();

		let matchingItem = this.findMatchingItem(this.items, index);
		if (matchingItem.layer == 3) {
			let disabled = [
				this.$addSubName,
				this.$addSubLink,
				this.$addSubButton
			];
			disabled.forEach(element => element.disabled = true);
		}

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

	//This method is called from various other methods in order to find the item with an id that matches the data-id of a specific navbar html element.
	//Each item in the array (starting with this.items) is checked. If the id matches, the item object is returned.
	//The method is called again on each item's nested items.
	findMatchingItem(objectArray, index) {
		for (let i = 0; i < objectArray.length; i++) {
			if (objectArray[i].id == index) {
				return objectArray[i];
			}
			let matchingItem = this.findMatchingItem(objectArray[i].subnavItems, index);
			if (matchingItem != undefined) {
				return matchingItem;
			}
		}
	}
	
	//Creates a new navbar item based on user input and then adds it to the item list.
	//The new item is given a "Move to end" dummy item for drag and drop purposes, unless the item is in layer 3.
	addNavItem(isSub, parentItem, event) {
		event.preventDefault();

		if (isSub == true) {
			let item = new NavItem(this.lastId+1, parentItem.id, parentItem.layer+1, this.$addSubName.value, this.$addSubLink.value);
			if (item.layer == 2) {
				item.subnavItems.push(new NavItem(item.id+1, item.id, item.layer+1, "Move to end", "#"));
				this.lastId = this.lastId + 2;
			}
			else {
				this.lastId = this.lastId + 1;
			}
			let moveToEnd = parentItem.subnavItems.pop();
			parentItem.subnavItems.push(item);
			parentItem.subnavItems.push(moveToEnd);
		}
		else {
			let item = new NavItem(this.lastId+1, -1, 1, this.$name.value, this.$link.value);
			item.subnavItems.push(new NavItem(item.id+1, item.id, 2, "Move to end", "#"));
			let moveToEnd = this.items.pop();
			this.items.push(item);
			this.items.push(moveToEnd);

			this.lastId = this.lastId + 2;
		}
		this.load();
	}

	//Edits a navbar html element's properties based on user input. Also changes the matching item object's properties to match.
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

	//Removes an existing navbar item from the list.
	//If the deleteFromParent method does not find an item to delete, then the item is a top level item and is deleted directly from this.items.
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

	//Deletes an item by searching through an array to find it.
	//Checks all the nested items of each item in the array (starting with this.items). If a nested itself has nested items, the method is called again on those items.
	//If the object is not found (persumably because it is a top level object), the method return false.
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

	//Saves the indices of a dragged nav item and displays all (most) subnav and moveToEnd items.
	dragStart(event) {				
		event.dataTransfer.setData("text/plain", event.target.parameters);
		let item = this.findMatchingItem(this.items, event.target.parameters);
		let parentItem = this.findMatchingItem(this.items, item.parentId);

		setTimeout(() => { //This function is called to work around a rendering bug in Chrome and Edge.
			let moveToEndElements = document.getElementsByClassName("move-to-end");
			for (let i = 0; i < moveToEndElements.length; i++) {
				moveToEndElements[i].style.display = "block";
			}
		}, 0);
	}

	//First, the method hides all subnav bars.
	//Then, the target element's nested items are unhidden, as well as the nested "Move to end" item if it exists.
	//Last, the subnav that the item is nested in is unhidden, in case the target itself is nested.
	//The end result is that whenever an item is dragged over another item, that item's nested items are all displayed properly.
	dragEnter(event) {
		event.target.classList.add("drag-over");
		let elements = document.getElementsByClassName("subnav-content");
		for (let i = 0; i < elements.length; i++) {
			elements[i].style.display = "none";
		}
		let itemHTML = document.querySelector(`div[data-id="${event.target.dataset.id}"]`);
		let item = this.findMatchingItem(this.items, event.target.dataset.id);
		itemHTML.lastElementChild.style.display = "block";
		let parentHTML = itemHTML.parentElement;
		parentHTML.style.display = "block";
		for (let i = 2; i < item.layer; i++) {
			parentHTML = parentHTML.parentElement.parentElement;
			parentHTML.style.display = "block";
		}
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
		/*		
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
		*/

		event.target.classList.remove("drag-over");
		let dragItem = this.findMatchingItem(this.items, event.dataTransfer.getData("text/plain"));
		let dropItem = this.findMatchingItem(this.items, event.target.parameters);

		let isParent = this.checkParent(dragItem, dropItem);
		let isMoveToEndSibling = this.checkMoveToEndSibling(dragItem, dropItem);

		if (isParent == false) {
			if (isMoveToEndSibling == false) {
				if (dragItem.id != dropItem.id) {
					console.log("Drop item is a valid drop target.");
					let dragParent = this.findMatchingItem(this.items, dragItem.parentId);
					let dropParent = this.findMatchingItem(this.items, dropItem.parentId);
					let i, j;
					for (i = 0; i < dragParent.subnavItems.length; i++) {
						if (dragParent.subnavItems[i].id == dragItem.id) {
							dragParent.subnavItems.splice(i, 1);
						}
					}
					for (j = 0; i < dropParent.subnavItems.length; i++) {
						if (dropParent.subnavItems[i].id == dropItem.id) {
							if (i > j) {
								dropParent.subnavItems.splice(j, 0, dragItem);
							}
							else {
								dropParent.subnavItems.splice(i, 0, dragItem);
							}
						}
					}
				}
				else {
					console.log("Error: Item cannot be dropped on itself.");
				}
			}
			else {
				console.log("Error: Drag item is the sibling of the move to end drop item.")
			}
		}
		else {
			console.log("Error: Item cannot be placed into its own nested items.");
		}
		
		this.load();
	}

	checkParent(parentItem, childItem) {
		if (childItem.parentId == parentItem.id) {
			return true;
		}
		if (childItem.parentId != -1) {
			let newChild = this.findMatchingItem(this.items, childItem.parentId);
			return this.checkParent(parentItem, newChild);
		}
		return false;
	}

	checkMoveToEndSibling(dragItem, dropItem) {
		if (dropItem.name == "Move to end" && dragItem.parentId == dropItem.parentId) {
			return true;
		}
		else {
			return false;
		}
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
				this.lastId = data.lastId;			
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
			items: this.items,
			lastId: this.lastId
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
			items: [new NavItem(0, 1,"Move to end", "#")],
			lastId: 0
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
			user: this.$addUserInput.value
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
