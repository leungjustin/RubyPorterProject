const MAX_LAYER = 2;

class NavItem {
	constructor(id, parentId, layer, name, link, isDisabled = false) {
		this.id = id;
		this.parentId = parentId;
		this.layer = layer;
		this.name = name;
		this.link = link;
		this.isDisabled = isDisabled; //Determines whether the item can be clicked on.
		this.items = []; //Contains an item's subitems, which are also objects of the NavItem class.
	}
}

class NavBar {
	constructor() {
		this.items = [
			new NavItem(0, -1, 1, "PRODUCTS", "#products"),
			new NavItem(1, -1, 1, "ABOUT", "#about"),
			new NavItem(2, -1, 1, "BLOG", "#blog"),
			new NavItem(3, -1, 1, "CONTACT", "#contact"),
			new NavItem(4, -1, 1, "Move to end", "#")
		];
		this.items[0].items.push(new NavItem(5, 0, 2, "Move to end", "#"));
		this.items[1].items.push(new NavItem(6, 1, 2, "HISTORY", "#history"));
		this.items[1].items[0].items.push(new NavItem(7, 6, 3, "Move to end", "#"));
		this.items[1].items.push(new NavItem(8, 1, 2, "OUR PROCESS", "#our-process"));
		this.items[1].items[1].items.push(new NavItem(9, 8, 3, "Move to end", "#"));
		this.items[1].items.push(new NavItem(10, 1, 2, "TEAM", "#team"));
		this.items[1].items[2].items.push(new NavItem(11, 10, 3, "Move to end", "#"));
		this.items[1].items.push(new NavItem(12, 1, 2, "Move to end", "#"));
		this.items[2].items.push(new NavItem(13, 2, 2, "Move to end", "#"));
		this.items[3].items.push(new NavItem(14, 3, 2, "Move to end", "#"));

		this.lastId = 14;

		this.navStyle = "none";			
		this.logo = "gates-of-fennario-logo.png";
		
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
		};

		this.disableAll();
		let disabled = [
			this.$name,
			this.$link,
			this.$addButton
		];
		disabled.forEach(element => element.disabled = true);

		this.$addForm.onsubmit = this.addNavItem.bind(this, null);
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
			window.onscroll = this.scroll.bind(this);
		}
		else if (this.$navStyle.value == "vertical") {
			this.navStyle = "vertical";
			this.$navbar.className = "navbar vertical";
			window.onscroll = () => {};
		}
		else {
			this.navStyle = "none";
			this.$navbar.className = "navbar";
			window.onscroll = () => {};
		}
		this.enableAll();
		this.load();
		window.onscroll = this.scroll.bind(this);
	}

	//Calls many other methods in order to properly render the navbar and set all forms to default.
	load() {		
		this.fillItems();		
		this.changeActive(this.items, window.location.hash);
		this.addEventListeners();
		this.disableAll();
		if (this.navStyle == "none") {
			this.$navbar.innerHTML = "";
			let disabled = [
				this.$name,
				this.$link,
				this.$addButton
			];
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
			let itemHTML = document.querySelector(`a[data-id="${item.id}"]`);
			itemHTML.classList.remove("active");
			if (item.link == hash) {
				itemHTML.classList.add("active");
				if (item.parentId != -1) {
					let parent = itemHTML;
					for (let i = 1; i < item.layer; i++) {
						parent = parent.parentElement.parentElement.parentElement.childNodes[1];
						parent.classList.add("active");
					}
				}
			}
			if (item.items.length > 1) {
				this.changeActive(item.items, hash);
			}
		});
	}

	//Sets the css file that will be used based on user settings, then calls renderNavItem to generate the navbar html.
	fillItems() {
		if (this.$navbar.classList.contains("vertical")) {
			this.$cssId.href = "project1.css";
		}
		else if (this.$navbar.classList.contains("horizontal")) {
			this.$cssId.href = "navbarstyles.css";
		}
		else {
			this.$cssId.href = "";
		}
		let itemsHTML = this.items.map(item => this.renderNavItem(item)).join(''); //Generates html for each navbar item, then joins them all together.
		this.$navbar.innerHTML = `
			<div>
				<img src="${this.logo}" alt="Logo">
			</div>
			<div class="navbar-content">
				${itemsHTML}
				<i class="fa-brands fa-instagram fa-2xl social"></i>
				<i class="fa-brands fa-facebook fa-2xl social"></i>
			</div>
		`;
	}

	//Creates the html for a single navbar item. If the item has nested item in it, the method is called again on each of the nested items.
	renderNavItem(item) {
		let navString = `
			<div class="subnav ${item.name == 'Move to end' ? 'move-to-end' : ''} ${item.layer > MAX_LAYER ? 'max-layer' : ''}" ${item.name == "Move to end" ? "style='display: none;'" : ""} data-id="${item.id}">
				<a href="${item.link}" ${item.isDisabled ? 'isDisabled' : ''}" draggable="true" data-id="${item.id}">${item.name} ${item.items.length > 1 ? this.navStyle == "horizontal" ? "<i class='fa-solid fa-angle-down fa-xs'></i>" : "<i class='fa-solid fa-angle-right fa-xs'></i>" : ""}</a>
				<button data-id="${item.id}">E</button>
				<div class="subnav-content">
		`;
		for (let i = 0; i < item.items.length; i++) {
			navString += this.renderNavItem(item.items[i]); //Each recursive call to this method adds a new subitem to the navbar string.
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
		if (matchingItem.layer == MAX_LAYER) {
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

		this.$editForm.onsubmit = this.submitEdit.bind(this, matchingItem, index);
		this.$deleteButton.onclick = this.deleteNavItem.bind(this, index);
		this.$enableDisableButton.onclick = this.enableOrDisableLink.bind(this, index);
		this.$addSubForm.onsubmit = this.addNavItem.bind(this, matchingItem);
	}

	//This method is called from various other methods in order to find the item with an id that matches the data-id of a specific navbar html element.
	//Each item in the array (starting with this.items) is checked. If the id matches, the item object is returned.
	//The method is called again on each item's nested items.
	findMatchingItem(objectArray, index) {
		for (let i = 0; i < objectArray.length; i++) {
			if (objectArray[i].id == index) {
				return objectArray[i];
			}
			let matchingItem = this.findMatchingItem(objectArray[i].items, index);
			if (matchingItem != undefined) {
				return matchingItem;
			}
		}
	}
	
	//Creates a new navbar item based on user input and then adds it to the item list.
	//The new item is given a "Move to end" dummy item for drag and drop purposes.
	addNavItem(parentItem, event) {
		event.preventDefault();

		let item;
		if (parentItem == null) {
			parentItem = this;
			item = new NavItem(this.lastId+1, -1, 1, this.$name.value, this.$link.value);
		}
		else {
			item = new NavItem(this.lastId+1, parentItem.id, parentItem.layer+1, this.$addSubName.value, this.$addSubLink.value);
		}
		item.items.push(new NavItem(item.id+1, item.id, item.layer+1, "Move to end", "#"));
		let moveToEnd = parentItem.items.pop();
		parentItem.items.push(item);
		parentItem.items.push(moveToEnd);
		this.lastId += 2;

		this.load();
	}

	//Edits a navbar html element's properties based on user input. Also changes the matching item object's properties to match.
	submitEdit(item, index, event) {
		event.preventDefault();

		let editHTML = document.querySelector(`a[data-id="${index}"]`);
		editHTML.innerHTML = this.$editName.value;
		editHTML.href = this.$editLink.value;
		editHTML.onclick = this.reload.bind(this, editHTML.href);
		if (editHTML.classList.contains("active")) {
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
			for (let j = 0; j < objectArray[i].items.length; j++) {
				if (objectArray[i].items[j].id == index) {
					objectArray[i].items.splice(j, 1);
					return true;
				}
			}
			if (objectArray[i].items.length > 1) {
				let isDeleted = this.deleteFromParent(objectArray[i].items, index);
				if (isDeleted == true) {
					return true;
				}
			}
		}
		return false;
	}

	//Changes whether a navbar item is clickable or not.
	enableOrDisableLink(index) {
		let matchingItem = this.findMatchingItem(this.items, index);

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
		if (item.layer < MAX_LAYER) {
			itemHTML.lastElementChild.style.display = "block";
		}
		let parentHTML = itemHTML.parentElement;
		if (item.layer != 1) {
			parentHTML.style.display = "block";
		}
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
	//The bulk of the method is broken into three parts.
	//First, find the parent items of both the drag item and the drop item.
	//Then, find the drag item in the drag parent item's array and remove it.
	//Finally, find the drop item in the drop parent item's array and insert the drag item into that spot.
	//All of this code only runs if...
		//The drag item isn't the parent of the drop item,
		//The drop item isn't the move to end item that shares a parent with the drop item,
		//And the item isn't being dropped onto itself.
	drop(event) {
		event.target.classList.remove("drag-over");

		let dragItem = this.findMatchingItem(this.items, event.dataTransfer.getData("text/plain"));
		let dropItem = this.findMatchingItem(this.items, event.target.parameters);

		let isParent = this.checkParent(dragItem, dropItem);
		let isMoveToEndSibling = this.checkMoveToEndSibling(dragItem, dropItem);

		if (isParent == false) {
			if (isMoveToEndSibling == false) {
				if (dragItem.id != dropItem.id) {
					let dragParent = this.findMatchingItem(this.items, dragItem.parentId);
					if (dragParent == undefined) {
						dragParent = this;
					}
					let dropParent = this.findMatchingItem(this.items, dropItem.parentId);
					if (dropParent == undefined) {
						dropParent = this;
					}

					let removed = false;
					let i = 0;
					while (removed == false && i < dragParent.items.length) {
						if (dragParent.items[i].id == dragItem.id) {
							dragParent.items.splice(i, 1);
							removed = true;
						}
						else {
							i++;
						}
					}

					let inserted = false;
					let j = 0;
					while (inserted == false && j < dropParent.items.length) {
						if (dropParent.items[j].id == dropItem.id) {
							if (i > j || dragItem.parentId != dropItem.parentId) { //i and j are compared to make sure the drag item is inserted properly.
								dropParent.items.splice(j, 0, dragItem);
							}
							else {
								dropParent.items.splice(j+1, 0, dragItem);
							}
							dragItem.parentId = dropItem.parentId;
							dragItem.layer = dropItem.layer;
							this.changeChildrenLayers(dragItem.items, dragItem.layer+1);
							inserted = true;
						}
						else {
							j++;
						}
					}
				}
			}
			else {
				alert("Error: Drag item is the sibling of the move to end drop item.")
			}
		}
		else {
			alert("Error: Item cannot be placed into its own nested items.");
		}
		
		this.load();
	}

	//Checks if an item is the parent of another item or any of its subitems, calling itself recursively until it reaches the lowest layer or returns true.
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

	//Checks if an item has the same parent as another item and if said item is a move to end item.
	checkMoveToEndSibling(dragItem, dropItem) {
		if (dropItem.name == "Move to end" && dragItem.parentId == dropItem.parentId) {
			return true;
		}
		else {
			return false;
		}
	}

	//Changes a parent item's child items' layers to be what they should be based on the layer of the parent item.
	changeChildrenLayers(objectArray, layer) {
		objectArray.forEach(item => {
			item.layer = layer;
			if (item.items.length > 0) {
				this.changeChildrenLayers(item.items, layer+1);
			}
		});
	}

	scroll() {
		/*let navbar = document.getElementById("navbar");
		if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
			navbar.style.height = "50px";
			navbar.style.transition = "height 0.2s";
		}
		else {
			navbar.style.height = "100px";
			navbar.style.transition = "height 0.2s";
		}*/
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
				this.findLastId(this.items);			
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

	findLastId(objectArray) {
		objectArray.forEach(item => {
			if (item.id > this.lastId) {
				this.lastId = item.id;
			}
			if (item.items.length > 0) {
				this.findLastId(item.items);
			}
		});
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
