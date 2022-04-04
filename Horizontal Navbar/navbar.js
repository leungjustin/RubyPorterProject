class NavBar {
	constructor() {
		this.items = [];
		this.$addForm = document.getElementById("addForm");
		this.$name = document.getElementById("name");
		this.$link = document.getElementById("link");
		this.$editForm = document.getElementById("editForm");
		this.$editName = document.getElementById("editName");
		this.$editLink = document.getElementById("editLink");
		this.$editButton = document.getElementById("editButton");
		this.$addSubForm = document.getElementById("addSubForm");
		this.$addSubName = document.getElementById("addSubName");
		this.$addSubLink = document.getElementById("addSubLink");
		this.$addSubButton = document.getElementById("addSubButton");
		
		this.fillItems();
		this.$addForm.onsubmit = this.addNavItem.bind(this);
		this.addEventListeners();
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
				<a href="${item.link}">${item.name}</a>
				<button id="delete${index}">X</button>
				<button id="edit${index}">E</button>
				`;
		}
		else {
			let navString = `
				<div class="subnav">
					<a href="${item.link}">${item.name}</a>
					<button id="delete${index}">X</button>
					<button id="edit${index}">E</button>
					<div class="subnav-content">
			`;
			for (let i = 0; i < item.subnavItems.length; i++) {
				navString += `
					<a href="${item.subnavItems[i].link}">${item.subnavItems[i].name}</a>
					<button id="subdelete${i},${index}">X</buton>
					<button id="subedit${i},${index}">E</button>
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
			document.getElementById("delete"+i).onclick = this.deleteNavItem.bind(this, i);
			document.getElementById("edit"+i).onclick = this.editNavItem.bind(this, i);
		}
		let disabled = [this.$editName, this.$editLink, this.$editButton, this.$addSubName, this.$addSubLink, this.$addSubButton];
		disabled.forEach(element => element.disabled = true);
	}
	
	addNavItem(event) {
		event.preventDefault();
		let navItem = {
			name: this.$name.value,
			link: this.$link.value
		};
		this.items.push(navItem);
		this.fillItems();
		this.addEventListeners();
		let forms = [this.$addForm, this.$editForm, this.$addSubForm];
		forms.forEach(element => element.reset());
	}

	deleteNavItem(index) {
		this.items.splice(index, 1);
		this.fillItems();
		this.addEventListeners();
		let forms = [this.$addForm, this.$editForm, this.$addSubForm];
		forms.forEach(element => element.reset());
	}

	editNavItem(index) {
		let enabled = [this.$editName, this.$editLink, this.$editButton, this.$addSubName, this.$addSubLink, this.$addSubButton];
		enabled.forEach(element => element.disabled = false);
		this.$editName.value = this.items[index].name;
		this.$editLink.value = this.items[index].link;

		this.$editForm.onsubmit = this.submitEdit.bind(this, index);
		this.$addSubForm.onsubmit = this.addSubnavItem.bind(this, index);
	}

	submitEdit(index, event) {
		event.preventDefault();
		this.items[index].name = this.$editName.value;
		this.items[index].link = this.$editLink.value;
		this.fillItems();
		this.addEventListeners();
		let forms = [this.$addForm, this.$editForm, this.$addSubForm];
		forms.forEach(element => element.reset());
	}

	addSubnavItem(index, event) {
		event.preventDefault();
		let subnavItem = {
			name: this.$addSubName.value,
			link: this.$addSubLink.value
		};
		if (this.items[index].subnavItems == null) {
			this.items[index].subnavItems = [];
		}
		this.items[index].subnavItems.push(subnavItem);
		this.fillItems();
		this.addEventListeners();
		let forms = [this.$addForm, this.$editForm, this.$addSubForm];
		forms.forEach(element => element.reset());
	}
}

new NavBar();