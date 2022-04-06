const URL = "file:///C:/Users/cal.don/Desktop/RubyPorterProject/Horizontal%20Navbar/Horizontal%20Navbar%20Template.html";

class NavItem {
	constructor(name, link) {
		this.name = name,
		this.link = link,
		this.isActive = false,
		this.isDisabled = false,
		this.subnavItems = [];
	}
}

class NavBar {
	constructor() {
		this.items = [
			new NavItem("Item1", "#item1"),
			new NavItem("Item2", "#item2")
		];
		this.items[0].subnavItems.push(new NavItem("Subitem1", "#subitem1"));
		this.items[0].subnavItems.push(new NavItem("Subitem2", "#subitem2"));
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

	reload() {
		this.fillItems();
		this.addEventListeners();
		this.disableAll();
		this.resetForms();
	}

	fillItems() {
		let itemsHTML = `<div class="logo">Logo</div>`;
		itemsHTML += this.items.reduce(
			(html, item, index) => html += this.renderNavItem(item, index), '');
			
		document.getElementById("navbar").innerHTML = itemsHTML;
	}

	renderNavItem(item, index) {
		if (item.subnavItems == null) {
			return `
				<a href="${item.link}" class="${item.isActive ? 'active' : ''} ${item.isDisabled ? 'isDisabled' : ''}" id="item${index}">${item.name}</a>
				<button id="edit${index}">E</button>
				`;
		}
		else {
			let navString = `
				<div class="subnav">
					<a href="${item.link}" class="${item.isActive ? 'active' : ''} ${item.isDisabled ? 'isDisabled' : ''}" id="item${index}">${item.name}</a>
					<button id="edit${index}">E</button>
					<div class="subnav-content">
			`;
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

	addEventListeners() {
		for (let i = 0; i < this.items.length; i++) {
			for (let j = 0; j < this.items[i].subnavItems.length; j++) {
				document.getElementById("subitem"+j+","+i).onclick = this.changeActive.bind(this, "subitem", j, i);
				document.getElementById("subedit"+j+","+i).onclick = this.editSubnavItem.bind(this, j, i);
			}
			document.getElementById("item"+i).onclick = this.changeActive.bind(this, "item", i);
			document.getElementById("edit"+i).onclick = this.editNavItem.bind(this, i);
		}
	}

	disableAll() {
		this.$enableDisableButton.innerHTML = "Enable/Disable Link";
		let disabled = [this.$editName, this.$editLink, this.$editButton, this.$deleteButton, this.$enableDisableButton, this.$addSubName, this.$addSubLink, this.$addSubButton];
		disabled.forEach(element => element.disabled = true);
	}

	enableAll() {
		let enabled = [this.$editName, this.$editLink, this.$editButton, this.$deleteButton, this.$enableDisableButton, this.$addSubName, this.$addSubLink, this.$addSubButton];
		enabled.forEach(element => element.disabled = false);
	}

	enableSub() {
		let enabled = [this.$editName, this.$editLink, this.$editButton, this.$deleteButton];
		enabled.forEach(element => element.disabled = false);
	}

	resetForms() {
		let forms = [this.$addForm, this.$editForm, this.$addSubForm];
		forms.forEach(element => element.reset());
	}

	changeActive(string, index, parentindex = -1) {
		this.items.forEach(item => {
			item.isActive = false;
			item.subnavItems.forEach(subItem => subItem.isActive = false);
		});
		if (string == "item") {
			this.items[index].isActive = true;
		}
		if (string == "subitem") {
			this.items[parentindex].subnavItems[index].isActive = true;
		}
		this.reload();
	}
	
	addNavItem(event) {
		event.preventDefault();
		let item = new NavItem(this.$name.value, this.$link.value);
		this.items.push(item);
		this.reload();
	}

	editNavItem(index) {
		this.disableAll();
		this.enableAll();
		this.$editName.value = this.items[index].name;
		this.$editLink.value = this.items[index].link;

		if (this.items[index].isDisabled) {
			this.$enableDisableButton.innerHTML = "Enable Link";
		}
		else {
			this.$enableDisableButton.innerHTML = "Disable Link";
		}

		this.$editForm.onsubmit = this.submitEdit.bind(this, index);
		this.$deleteButton.onclick = this.deleteNavItem.bind(this, index);
		this.$enableDisableButton.onclick = this.enableOrDisableLink.bind(this, index);
		this.$addSubForm.onsubmit = this.addSubnavItem.bind(this, index);
	}

	submitEdit(index, event) {
		event.preventDefault();
		this.items[index].name = this.$editName.value;
		this.items[index].link = this.$editLink.value;
		this.reload();
	}

	deleteNavItem(index) {
		this.items.splice(index, 1);
		this.reload();
	}

	enableOrDisableLink(index) {
		if (this.items[index].isDisabled) {
			this.items[index].isDisabled = false;
		}
		else {
			this.items[index].isDisabled = true;
		}
		this.reload();
	}

	addSubnavItem(index, event) {
		event.preventDefault();
		let subItem = new NavItem(this.$addSubName.value, this.$addSubLink.value)
		this.items[index].subnavItems.push(subItem);
		this.reload();
	}

	editSubnavItem(index, parentindex) {
		this.disableAll();
		this.enableSub();
		this.$editName.value = this.items[parentindex].subnavItems[index].name;
		this.$editLink.value = this.items[parentindex].subnavItems[index].link;
		
		this.$editForm.onsubmit = this.submitSubEdit.bind(this, index, parentindex);
		this.$deleteButton.onclick = this.deleteSubnavItem.bind(this, index, parentindex);
	}

	submitSubEdit(index, parentindex, event) {
		event.preventDefault();
		this.items[parentindex].subnavItems[index].name = this.$editName.value;
		this.items[parentindex].subnavItems[index].link = this.$editLink.value;
		this.reload();
	}

	deleteSubnavItem(index, parentindex) {
		this.items[parentindex].subnavItems.splice(index, 1);
		this.reload();
	}
}

new NavBar();