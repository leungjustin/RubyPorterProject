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
		this.items[0].subnavItems.push(new NavItem("Move to end", "#"));
		this.items[1].subnavItems.push(new NavItem("Subitem1", "#subitem1"));
		this.items[1].subnavItems.push(new NavItem("Subitem2", "#subitem2"));
		this.items[1].subnavItems.push(new NavItem("Move to end", "#"));
		this.items[2].subnavItems.push(new NavItem("Subitem3", "#subitem3"));
		this.items[2].subnavItems.push(new NavItem("Move to end", "#"));
		this.items[3].subnavItems.push(new NavItem("Move to end", "#"));

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
		this.$navbar = document.getElementById('navbar');
		this.$cssId = document.getElementById('cssId');
		this.$navStyle = document.getElementById('navStyle');
		this.$userForm = document.getElementById('userForm');
		this.$userInput = document.getElementById('userInput');		
		this.$editSettings = document.getElementById('editSettings');

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

		this.$addForm.onsubmit = this.addNavItem.bind(this);		
		this.$navStyle.onchange = this.changeNavStyle.bind(this);			
		this.$userForm.onsubmit = this.retrieveNavSettings.bind(this);
		this.$editSettings.onclick = this.setNavSettings.bind(this);	
	}

	//This method runs when the navigation style is chosen and adds a vertical or horizontal class to the navbar div.
	changeNavStyle() {
		if (this.$navStyle.value == 'horizontal')
		{
			this.navStyle = 'horizontal';
			this.$navbar.className = 'navbar horizontal';			
		}
		else if (this.$navStyle.value == 'vertical')
		{
			this.navStyle = 'vertical';
			this.$navbar.className = 'navbar vertical';
		}
		else 
		{
			this.navStyle = 'none';
			this.$navbar.className = 'navbar';
		}
		this.enableAll();
		this.load();
	}

	//Renders the navbar, sets the active item if there is one, and disables all edit forms.
	load() {		
		this.fillItems();		
		this.changeActive(window.location.hash);
		this.addEventListeners(this.items);
		this.disableAll();
		if (this.navStyle == 'none')
		{
			this.$navbar.innerHTML = "";
			let disabled = [this.$name, this.$link, this.$addButton];
			disabled.forEach(element => element.disabled = true);

		}
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
		else
		{
			this.$cssId.href = "";
		}
		let itemsHTML = this.items.map((item) => this.renderNavItem(item)).join('');
		this.$navbar.innerHTML = `
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
			<div ${item.subnavItems[i].name == "Move to end" ? "style='display: none;'" : ""} id="subnavContent${item.subnavItems[i].name},${item.name}">
				<a href="${item.subnavItems[i].link}" ${item.subnavItems[i].isActive ? 'class="active"' : ''} draggable="true" id="subitem${item.subnavItems[i].name},${item.name}">${item.subnavItems[i].name}</a>
				<button id="subedit${item.subnavItems[i].name},${item.name}">E</button>
			</div>
		`;
	}


	//Adds click and submit events for navbar items and buttons.
	addEventListeners(objectArray, parentIndex = -1) {		
		
		//Adds events to each navbar item.
		for (let i = 0; i < this.items.length; i++) {
			//Adds events to each item's subitems, if it has any.			
			for (let j = 0; j < this.items[i].subnavItems.length; j++) {
				let subitem = document.getElementById("subitem"+this.items[i].subnavItems[j].name+","+this.items[i].name);
				subitem.onclick = this.reload.bind(this, this.items[i].subnavItems[j].link);
				document.getElementById("subedit"+this.items[i].subnavItems[j].name+","+this.items[i].name).onclick = this.editSubnavItem.bind(this, j, i);
				subitem.ondragstart = this.dragStart.bind(this);
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
			item.ondragstart = this.dragStart.bind(this);
			item.ondragenter = this.dragEnter;
			item.ondragover = this.dragOver;
			item.ondragleave = this.dragLeave.bind(this);
			item.ondragend = this.dragEnd.bind(this);
			item.ondrop = this.drop.bind(this);
			item.parameters = i.toString();
		}
		
		/*
		for (let i = 0; i < objectArray.length; i++) {
			if (objectArray[i].subnavItems.length > 1) {
				this.addEventListeners(objectArray[i].subnavItems, i);
			}
			let item;
			if (parentIndex == -1) {
				item = document.getElementById("item"+objectArray[i].name);
				document.getElementById("edit"+objectArray[i].name).onclick = this.editNavItem.bind(this, i);
			}
			else {
				item = document.getElementById("subitem"+objectArray[i].name+","+this.items[parentIndex].name);
				document.getElementById("subedit"+objectArray[i].name+","+this.items[parentIndex].name).onclick = this.editSubnavItem.bind(this, i, parentIndex);
			}
			item.onclick = this.reload.bind(this, objectArray[i].link);
			item.ondragstart = this.dragStart.bind(this);
			item.ondragenter = this.dragEnter.bind(this);
			item.ondragover = this.dragOver.bind(this);
			item.ondragleave = this.dragLeave.bind(this);
			item.ondragend = this.dragEnd.bind(this);
			item.ondrop = this.drop.bind(this);
			item.parameters = (i+`${parentIndex == -1 ? "" : ","+parentIndex}`);
		}
		*/
	}

	//Disables all fields and buttons in all forms.
	disableAll() {
		this.$enableDisableButton.innerHTML = "Enable/Disable Link";
		let disabled = [this.$editName, this.$editLink, this.$editButton, this.$deleteButton, this.$enableDisableButton, this.$addSubName, this.$addSubLink, this.$addSubButton];
		disabled.forEach(element => element.disabled = true);
	}

	//Enables all fields and buttons in all forms.
	enableAll() {
		let enabled = [this.$name, this.$link, this.$addButton, this.$editName, this.$editLink, this.$editButton, this.$deleteButton, this.$enableDisableButton, this.$addSubName, this.$addSubLink, this.$addSubButton];
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
		item.subnavItems.push(moveToEnd);
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
		let moveToEnd = this.items[index].subnavItems.pop();
		this.items[index].subnavItems.push(subItem);
		this.items[index].subnavItems.push(moveToEnd);

		//Renders the new subitem and adds it to the navbar.
		this.load();
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

	//Saves the indices of a dragged nav item and displays all (most) subnav and moveToEnd items.
	dragStart(event) {				
		event.dataTransfer.setData("text/plain", event.target.parameters);
		let dragIndex = event.target.parameters;
		let dragArray = dragIndex.split(",");
		//This is called to work around a rendering bug in Chrome and Edge.
		setTimeout(() => {
			//If the drag item is a subitem, displays the moveToEnd item in the top level array.
			if (dragArray.length != 1) {
				document.getElementById("subnavMove to end").style.display = "block";
			}
			let subnavArray = document.getElementsByClassName("subnav-content");
			//For each nav item...
			for (let i = 0; i < subnavArray.length; i++) {
				subnavArray[i].style.display = "block"; //Displays its subitems, and...
				//If the item is not a moveToEnd item, display the item's moveToEnd subitem.
				//Do not display the moveToEnd subitem if it is the item's own moveToEnd subitem, or if it is part of the same set of subitems.
				if (this.items[i].name != "Move to end" && ((dragArray.length == 1 && i != dragArray[0]) || (dragArray.length != 1 && i != dragArray[1]))) {
					document.getElementById("subnavContentMove to end,"+this.items[i].name).style.display = "block";
				}
			}
		}, 0);
	}

	//Add a red dashed box around the item being dragged over.
	dragEnter(event) {
		event.target.classList.add("drag-over");
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
			this.items = data.items;
			this.$navStyle.value = data.navStyle;
			this.navStyle = data.navStyle;
			this.changeNavStyle();
			
			console.log(data);

		})
		.catch(error => {
			console.log("There was a problem getting user settings.");
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
			while(isValid == false && userCounter < users.length)
			{
				if (users[userCounter].user == this.$userInput.value)
				{
					isValid = true;
				}
				userCounter++;
			}

			if (isValid)
			{
				fetch('http://justin.navigation.test/edit' , {
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