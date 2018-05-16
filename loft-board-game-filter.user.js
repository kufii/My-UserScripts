// ==UserScript==
// @name         Loft Lounge Board Game Filters
// @namespace    https://greasyfork.org/users/649
// @version      1.1.2
// @description  Adds Filters to the Loft Lounge board game page
// @author       Adrien Pyke
// @match        *://www.theloftlounge.ca/pages/board-games*
// @match        *://www.theloftlounge.ca/pages/new-games*
// @grant        none
// ==/UserScript==

(() => {
	'use strict';

	const SCRIPT_NAME = 'Loft Lounge Board Game Filters';

	const Util = {
		log(...args) {
			args.unshift(`%c${SCRIPT_NAME}:`, 'font-weight: bold;color: #233c7b;');
			console.log(...args);
		},
		q(query, context = document) {
			return context.querySelector(query);
		},
		qq(query, context = document) {
			return Array.from(context.querySelectorAll(query));
		},
		prepend(parent, child) {
			parent.insertBefore(child, parent.firstChild);
		},
		createTextbox() {
			let input = document.createElement('input');
			input.type = 'text';
			return input;
		},
		createCheckbox(lbl) {
			let label = document.createElement('label');
			let checkbox = document.createElement('input');
			checkbox.setAttribute('type', 'checkbox');
			label.appendChild(checkbox);
			label.appendChild(document.createTextNode(lbl));
			return label;
		},
		createButton(text, onclick) {
			let button = document.createElement('button');
			button.textContent = text;
			button.onclick = onclick;
			return button;
		},
		toTitleCase(str) {
			return str.replace(/[a-z0-9]+/gi, word => word.slice(0, 1).toUpperCase() + word.slice(1));
		},
		appendStyle(str) {
			let style = document.createElement('style');
			style.textContent = str;
			document.head.appendChild(style);
		}
	};

	Util.appendStyle(`
		/* Fix Ctrl+F */
		#sidebar-holder, #content-holder {
			position: static!important;
			height: auto!important;
		}
		#content {
			position: static!important;
			margin-left: 290px;
			width: auto;
		}
		#content-holder {
			width: 100%!important;
			float: right;
		}
		@media (max-width: 900px), (max-device-width: 1024px) {
			#content {
				margin-left: 0px;
			}
		}

		/* Additional Styles */
		.category-list {
			border: 1px solid black;
			border-radius: 6px;
			padding: 6px;
			background-color: white;
			color: black;
			position: absolute;
			z-index: 9999;
		}

		.rte table tr td:nth-of-type(1) {
			width: 75%;
		}

		.rte table tr td:nth-of-type(2) {
			width: 25%;
		}
	`);

	let table = Util.q('#page-content > div > table > tbody');
	let rows = Util.qq('tr:not(:first-of-type)', table);
	let categories = new Set(rows.map(row => {
		let typos = {
			'Triva': 'Trivia'
		};
		let td = Util.q('td:last-of-type', row);
		let category = Util.toTitleCase(td.textContent.trim());
		if (typos[category]) {
			td.textContent = category = typos[category];
		}
		return category;
	}).sort());

	let tr = document.createElement('tr');
	let td1 = document.createElement('td');
	let td2 = document.createElement('td');
	tr.appendChild(td1);
	tr.appendChild(td2);

	let nameFilter = Util.createTextbox();
	td1.appendChild(nameFilter);

	let selectedCategories = [];

	const filter = function() {
		rows.forEach(row => row.setAttribute('hidden', ''));
		let rowsFilter = rows;

		if (selectedCategories.length > 0) {
			rowsFilter = rowsFilter.filter(row => {
				let category = Util.q('td:last-of-type', row).textContent.trim().toLowerCase();
				return selectedCategories.includes(category);
			});
		}

		let value = nameFilter.value.trim().toLowerCase();
		if (value) {
			rowsFilter = rowsFilter.filter(row => {
				let name = Util.q('td:first-of-type', row).textContent.trim().toLowerCase();
				return name.includes(value);
			});
		}

		rowsFilter.forEach(row => row.removeAttribute('hidden'));
	};

	nameFilter.oninput = filter;

	let categoryDiv = document.createElement('div');
	categoryDiv.classList.add('category-list');
	categoryDiv.setAttribute('hidden', '');

	let categorySpan = document.createElement('span');

	categories.forEach(category => {
		let label = Util.createCheckbox(category);
		categoryDiv.appendChild(label);
		categoryDiv.appendChild(document.createElement('br'));
		let check = Util.q('input', label);
		check.oninput = () => {
			let cat = category.trim().toLowerCase();
			let index = selectedCategories.indexOf(cat);
			if (check.checked) {
				if (index === -1) {
					selectedCategories.push(cat);
				}
			} else if (index !== -1) {
				selectedCategories.splice(index, 1);
			}
			categorySpan.textContent = selectedCategories.map(category => Util.toTitleCase(category)).join(', ');
			filter();
		};
	});

	let categoryButton = Util.createButton('Categories...', () => {
		if (categoryDiv.hasAttribute('hidden')) {
			categoryDiv.removeAttribute('hidden');
		} else {
			categoryDiv.setAttribute('hidden', '');
		}
	});

	document.body.addEventListener('click', e => {
		if (e.target !== categoryButton && !categoryDiv.contains(e.target)) {
			categoryDiv.setAttribute('hidden', '');
		}
	});

	td2.appendChild(categoryButton);
	td2.appendChild(document.createElement('br'));
	td2.appendChild(categoryDiv);
	td2.appendChild(categorySpan);

	Util.prepend(table, tr);
})();
