
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

		this.logo = "gates-of-fennario-logo.png";
		this.icon = "gates-of-fennario-icon.png";

		this.lastId = 14;

		this.editingPage = window.location.pathname.includes("project1.html");
		if (this.editingPage) {
			this.navStyle = "none";	
			this.editMode = true;			
			
			this.bindElements();

			this.settings = {
				user: this.$userInput.value,
				navStyle: this.navStyle,
				items: this.items
			};

			this.retrieveNavSettings(new Event('submit'), "megan");

			this.disableAll();
			let disabled = [
				this.$name,
				this.$link,
				this.$addButton
			];
			disabled.forEach(element => element.disabled = true);
		}
		else {
			this.bindElementsStaticMenu();
			this.retrieveNavSettings(new Event('submit'), "megan");

			this.loadStaticMenu();
		}
	}

	//Binds all class properties to their corresponding html elements.
	//This must be called after enabling edit mode because the properties are unbound when the html elements were previously removed.
	bindElements() {
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

		this.$addForm.onsubmit = this.addNavItem.bind(this, null);
		this.$navStyle.onchange = this.changeNavStyle.bind(this);
		this.$userForm.onsubmit = this.retrieveNavSettings.bind(this, this.$userInput.value);
		this.$editSettings.onclick = this.setNavSettings.bind(this);
		this.$addUserForm.onsubmit = this.addUser.bind(this);	
		this.$deleteUserButton.onclick = this.deleteUser.bind(this);
    	window.onresize = this.load.bind(this);
	}

	bindElementsStaticMenu() {
		
		this.$navbar = document.getElementById("navbar");
		this.$cssId = document.getElementById("cssId");
		this.$navStyle = document.getElementById("navStyle");

    	window.onresize = this.loadStaticMenu.bind(this);
	}

	//This method runs when the navigation style is chosen and changes the css link to the correct file.
	changeNavStyle() {
		this.$navbar.removeAttribute("style");
		if (this.$navStyle.value == "horizontal" || this.navStyle == "horizontal") {
			this.navStyle = "horizontal";
			window.onscroll = this.scroll.bind(this);
		}
		else if (this.$navStyle.value == "vertical" || this.navStyle == "vertical") {
			this.navStyle = "vertical";
			window.onscroll = () => {};
		}
		else {
			this.$cssId.href = "";
			this.navStyle = "none";
			window.onscroll = () => {};
		}

		this.enableAll();
		this.load();
		this.changeContainer();
	}

	//Calls many other methods in order to properly render the navbar and set all forms to default.
	load() {		
		if (window.innerWidth < 1024) {
			this.fillItemsMobile();
		}
		else {
			this.fillItems();
		}				
		this.changeActive(this.items, window.location.hash);
		this.addEventListeners();
		this.disableAll();
		this.checkNone();
		this.resetForms();
	}

	loadStaticMenu() {
		if (window.innerWidth < 1024) {
			this.fillItemsMobile();
		}
		else {
			this.fillItems();
		}				
		this.changeActive(this.items, window.location.hash);
		this.addEventListeners();
	}

	//Same as load, expect without rendering the navbar or adding event listeners.
	reload(hash = window.location.hash) {
		this.changeActive(this.items, hash);		
		this.disableAll();
		this.resetForms();
	}

	//Removes the navbar html if there is no style selected.
	checkNone() {
		if (this.navStyle == "none") {
			this.$navbar.innerHTML = "";
			let disabled = [
				this.$name,
				this.$link,
				this.$addButton
			];
			disabled.forEach(element => element.disabled = true);
		}
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
		if (this.navStyle == "horizontal") {

			this.$cssId.href = "navbarstyles.css";
			document.querySelector(".container").style.paddingTop = "106px";
		}
		if (this.navStyle == "vertical") {
			this.$cssId.href = "project1.css";
			document.querySelector(".container").style.paddingTop = "0px";
		}		

		let itemsHTML = this.items.map(item => this.renderNavItem(item)).join(''); //Generates html for each navbar item, then joins them all together.
		this.$navbar.innerHTML = `
			<div>
				<img class="logo" src="${this.logo}" alt="Logo">
				${this.navStyle == "horizontal" ? "<img class='icon' src='" + this.icon + "' alt='icon'>" : ""}
			</div>
			<div class="navbar-content">
				${this.editingPage ? `<button id="editing">${this.editMode == true ? "Disable Edit Mode" : "Enable Edit Mode"} </button>` : ''}
				${itemsHTML}
				<i class="fa-brands fa-instagram fa-2xl social"></i>
				<i class="fa-brands fa-facebook fa-2xl social"></i>
			</div>
		`;
	}

	fillItemsMobile() {

		this.$cssId.href = "mobilestyle.css";
		document.querySelector(".container").style.paddingTop = "106px";

		window.onscroll = () => {};
		let itemsHTML = this.items.map(item => this.renderNavItem(item)).join('');
		this.$navbar.innerHTML = `
			<div>
				<img class="logo" src="${this.logo}" alt="Logo">
				${this.editingPage ? `<button id="editing">${this.editMode == true ? "Disable Edit Mode" : "Enable Edit Mode"} </button>` : ''}
				<i class="fa-brands fa-instagram fa-2xl social" style="margin-left: auto"></i>
				<i class="fa-brands fa-facebook fa-2xl social"></i>
				<i class="fa-solid fa-bars" id="bars"></i>
			</div>
			<div class="navbar-content">
				${itemsHTML}
			</div>
		`;
    document.querySelector("#bars").onclick = this.toggleMobileMenu.bind(this);
	}

	//Creates the html for a single navbar item. If the item has nested item in it, the method is called again on each of the nested items.
	renderNavItem(item) {
		let navString = `
			<div class="subnav ${item.name == 'Move to end' ? 'move-to-end' : ''} ${item.layer > MAX_LAYER ? 'max-layer' : ''}" ${item.name == "Move to end" ? "style='display: none;'" : ""} data-id="${item.id}">
				<a href="${item.link}" ${item.isDisabled ? 'isDisabled' : ''}" draggable="true" data-id="${item.id}">
					${item.name}
					${item.items.length > 1 ? this.navStyle == "horizontal" ? "<i class='fa-solid fa-angle-down fa-xs'></i>" : "<i class='fa-solid fa-angle-right fa-xs'></i>" : ""}
				</a>
				${this.editMode == true ? "<button data-id='" + item.id + "'>E</button>" : ""}
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

	toggleMobileMenu() {
		if (!document.querySelector(".navbar-content").classList.contains("active")) {
			document.querySelector(".navbar-content").classList.add("active");
			document.querySelector(".container").style.paddingTop = "0px";
		}
		else {
			document.querySelector(".navbar-content").classList.remove("active");
			document.querySelector(".container").style.paddingTop = "106px";
		}
	}

	//Adds click and submit events for navbar items and buttons.
	addEventListeners() {
		if (document.getElementById("editing") != null){
			document.getElementById("editing").onclick = this.toggleEditing.bind(this);
		}
		for (let i = 0; i <= this.lastId; i++) {
			let item = document.querySelector(`a[data-id="${i}"]`);
			if (item != null) {
				item.onclick = this.reload.bind(this, item.hash);
				if (this.editMode == true) {
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
	}

	//Changes the bulk of the page's html depending on if edit mode is on or off.
	changeContainer() {
		if (this.editMode == false) {
			document.querySelector(".container").innerHTML = `
				<img src="hero image.jpg" alt="hero image" width="100%">
				<div class="containerText">
					<h2 style="letter-spacing: 5px;">WELCOME.</h2>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis vel orci a sagittis. 
						In diam nisl, auctor rhoncus placerat vitae, facilisis quis tellus. Praesent fringilla lectus sit amet justo tristique vestibulum. 
						Mauris elit mi, pulvinar vitae metus eget, scelerisque malesuada nisi. Suspendisse ut euismod tellus. Etiam gravida felis risus. 
						In nisl sapien, bibendum quis velit fermentum, facilisis suscipit dui. Fusce vel urna enim. Morbi quis condimentum dui. 
						Sed pulvinar hendrerit volutpat. In ornare ac enim nec tempus. Curabitur suscipit tempor ullamcorper. 
						Nunc pretium risus in consectetur aliquam. Donec in nibh eget velit bibendum feugiat.
					</p>
				</div>		
			`;
		}
		else {
			document.querySelector(".container").innerHTML = `
				<!-- For adding a new navbar item -->
				<h2>Add Navbar Item</h2>
				<form action="#" method="post" id="addForm">
					<label for="name">Name:</label>
					<input type="text" name="name" id="name"><br>
					<label for="link">Link:</label>
					<input type="text" name="link" id="link"><br>
					<button type="submit" id="addButton">Add</button>
				</form>
		
				<!-- For editing an existing navbar item or subitem -->
				<h2>Edit Item</h2>
				<form action="#" method="post" id="editForm">
					<label for="name">Name:</label>
					<input type="text" name="name" id="editName" value=""><br>
					<label for="link">Link:</label>
					<input type="text" name="link" id="editLink" value=""><br>
					<button type="submit" id="editButton">Edit</button>
				</form>
				<button id="deleteButton">Delete Item</button>
				<button id="enableDisableButton">Enable/Disable Link</button>
		
				<!-- For adding a navbar subitem to an existing item -->
				<h2>Add Subnav Item</h2>
				<form action="#" method="post" id="addSubForm">
					<label for="name">Name:</label>
					<input type="text" name="name" id="addSubName"><br>
					<label for="link">Link:</label>
					<input type="text" name="link" id="addSubLink"><br>
					<button type="submit" id="addSubButton">Add</button>
				</form>
		
				<label for="navStyle"><h2>Navigation Bar Style</h2></label>
				<select name="navStyle" id="navStyle">
					<option value="blank" disabled selected></option>
					<option value="horizontal">Horizontal</option>
					<option value="vertical">Vertical</option>
				</select>
		
				<h2>Select User</h2>
				<form action="#" method="post" id="userForm">
					<label for="user"></label>
					<input type="text" name="user" id="userInput"><br>
					<button type="submit" id="userButton">Select</button>			
				</form>
				<button id="editSettings">Save Settings</button>
		
				<h2>Add/Remove User</h2>
				<form action="#" method="post" id="addUserForm">
					<label for="addUser">Username:</label>
					<input type="text" name="addUser" id="addUserInput"><br>
					<button type="submit" id="addUserButton">Add User</button>
				</form>
				<button id="deleteUserButton">Remove User</button>
			`;
			this.bindElements();
			this.disableAll();
		}
	}

	//Enables or disables editing of the navbar.
	toggleEditing() {
		this.editMode = !this.editMode;
		this.load();
		this.changeContainer();
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

		this.deleteRecurse(this.items, index);
		this.load();
	}

	//Deletes an item by searching through an array to find it.
	//Checks each item in the array (starting with this.items). If an item has nested items of its own, the method is called again on those items.
	deleteRecurse(objectArray, index) {
		for (let i = 0; i < objectArray.length; i++) {
			if (objectArray[i].items.length > 1) {
				this.deleteRecurse(objectArray[i].items, index);
			}
			if (objectArray[i].id == index) {
				objectArray.splice(i, 1);
			}
		}
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
		if (event.target.tagName != "I") {
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
	}

	//This must be called to allow an item to trigger the drop method when dropping onto an item.
	dragOver(event) {
		if (event.target.tagName != "I") {
			event.preventDefault();
		}
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

	//Expands or shrinks the horizontal navbar depending on if the page is scrolled.
	scroll() {
		let navbar = document.getElementById("navbar");
		let logo = document.querySelector(".logo");
		let icon = document.querySelector(".icon");
		if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
			navbar.style.height = "70px";
			navbar.style.transition = "height 0.2s";
			logo.style.padding = "15px";
			logo.style.height = "40px";
			logo.style.opacity = 0;
			logo.style.transition = "height 0.2s, opacity 0.2s ease-in-out";
			if (icon != null) {
				icon.style.padding = "15px";
				icon.style.height = "40px";
				icon.style.transition = "height 0.2s";
			}
			let subnavs = document.getElementsByClassName("subnav");
			for (let i = 0; i < subnavs.length; i++) {
				let item = this.findMatchingItem(this.items, subnavs[i].dataset.id);
				if (item.layer == 1) {
					subnavs[i].style.paddingTop = "15px";
					subnavs[i].style.paddingBottom = "9px";
					subnavs[i].style.transition = "padding 0.2s";
				}
			}
			let subnavcontents = document.getElementsByClassName("subnav-content");
			for (let i = 0; i < subnavcontents.length; i++) {
				subnavcontents[i].style.top = "76px";
				subnavcontents[i].style.transition = "top 0.2s";
			}
		}
		else {
			navbar.style.height = "100px";
			navbar.style.transition = "height 0.2s";
			logo.style.padding = "25px";
			logo.style.height = "50px";
			logo.style.opacity = 1;
			logo.style.transition = "height 0.2s, opacity 0.2s ease-in-out";
			if (icon != null)
			{
				icon.style.padding = "25px";
				icon.style.height = "50px";
				icon.style.transition = "height 0.2s";
			}
			let subnavs = document.getElementsByClassName("subnav");
			for (let i = 0; i < subnavs.length; i++) {
				let item = this.findMatchingItem(this.items, subnavs[i].dataset.id);
				if (item.layer == 1) {
					subnavs[i].style.paddingTop = "30px";
					subnavs[i].style.paddingBottom = "24px";
					subnavs[i].style.transition = "padding 0.2s";
				}
			}
			let subnavcontents = document.getElementsByClassName("subnav-content");
			for (let i = 0; i < subnavcontents.length; i++) {
				subnavcontents[i].style.top = "106px";
				subnavcontents[i].style.transition = "top 0.2s";
			}
		}
	}

	//Retrieve navigation items and navigation bar style based on user
	retrieveNavSettings(event, username) {
		if(event && event.preventDefault) {
			event.preventDefault();
		}	
		fetch(`http://justin.navigation.test/user/${username}`)
		.then(response => response.json())
		.then(data => {
			if (data) {
				this.items = data.items;
				if(this.$navStyle != null){
					this.$navStyle.value = data.navStyle;
				}
				this.navStyle = data.navStyle;	
				this.findLastId(this.items);			
			}
			else {
				this.items = [];
				if(this.$navStyle != null){
					this.$navStyle.value = "";
				}
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
				fetch(`http://justin.navigation.test/user/${this.$userInput.value}/edit` , {
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
			items: [new NavItem(0, -1, 1,"Move to end", "#")]
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
				fetch('http://justin.navigation.test/user' , {
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
				fetch(`http://justin.navigation.test/user/${this.$addUserInput.value}/delete` , {
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

