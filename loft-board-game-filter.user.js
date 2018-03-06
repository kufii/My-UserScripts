// ==UserScript==
// @name         Loft Lounge Board Game Filters
// @namespace    https://greasyfork.org/users/649
// @version      1.1
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
		onlyUnique(value, index, self) {
		    return self.indexOf(value) === index;
		},
		toTitleCase(str) {
			return str.replace(/\w\S*/g, txt => {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		},
		appendStyle(str) {
			let style = document.createElement('style');
			style.textContent = str;
			document.head.appendChild(style);
		}
	};

	Util.appendStyle(`#sidebar-holder, #content-holder {
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
		}`);

	let table = Util.q('#page-content > div > table > tbody');
	let rows = Util.qq('tr', table);
	let categories = rows.map(row => {
		let typos = {
			'Basment': 'Basement',
			'Basment Game': 'Basement',
			'2-player Small': 'Two Player Small'
		};
		let td = Util.q('td:nth-of-type(2)', row);
		let category = Util.toTitleCase(td.textContent.trim());
		if (typos[category]) {
			td.textContent = category = typos[category];
		}
		return category;
	}).filter(Util.onlyUnique).sort();

	let tr = document.createElement('tr');
	let td1 = document.createElement('td');
	td1.style.width = '75%';
	let td2 = document.createElement('td');
	td2.style.width = '25%';
	tr.appendChild(td1);
	tr.appendChild(td2);

	let nameFilter = Util.createTextbox();
	td1.appendChild(nameFilter);

	let selectedCategories = [];

	const filter = function() {
		rows.forEach(row => {
			row.style.display = 'none';
		});
		let rowsFilter = rows;

		if (selectedCategories.length > 0) {
			rowsFilter = rowsFilter.filter(row => {
				let category = Util.q('td:nth-of-type(2)', row).textContent.trim().toLowerCase();
				return selectedCategories.includes(category);
			});
		}

		let value = nameFilter.value.trim().toLowerCase();
		if (value) {
			rowsFilter = rowsFilter.filter(row => {
				let name = Util.q('td:nth-of-type(1)', row).textContent.trim().toLowerCase();
				return name.indexOf(value) !== -1;
			});
		}

		rowsFilter.forEach(row => {
			row.style.display = 'table-row';
		});
	};

	nameFilter.oninput = filter;

	let categoryDiv = document.createElement('div');
	categoryDiv.style.border = '1px solid black';
	categoryDiv.style.backgroundColor = 'white';
	categoryDiv.style.color = 'black';
	categoryDiv.style.position = 'absolute';
	categoryDiv.style.display = 'none';
	categoryDiv.style.zIndex = 9999;

	let categorySpan = document.createElement('span');

	categories.forEach(category => {
		let label = Util.createCheckbox(category);
		categoryDiv.appendChild(label);
		categoryDiv.appendChild(document.createElement('br'));
		let check = Util.q('input', label);
		check.onchange = () => {
			let cat = category.trim().toLowerCase();
			let index = selectedCategories.indexOf(cat);
			if (check.checked) {
				if (index === -1) {
					selectedCategories.push(cat);
				}
			} else if (index !== -1) {
				selectedCategories.splice(index, 1);
			}
			categorySpan.textContent = selectedCategories.map(category => {
				return Util.toTitleCase(category);
			}).join(', ');
			filter();
		};
	});

	let categoryButton = Util.createButton('Categories...', () => {
		if (categoryDiv.style.display === 'none') {
			categoryDiv.style.display = 'block';
		} else {
			categoryDiv.style.display = 'none';
		}
	});

	document.body.addEventListener('click', e => {
		if (e.target !== categoryButton && !categoryDiv.contains(e.target)) {
			categoryDiv.style.display = 'none';
		}
	});

	td2.appendChild(categoryButton);
	td2.appendChild(document.createElement('br'));
	td2.appendChild(categoryDiv);
	td2.appendChild(categorySpan);

	Util.prepend(table, tr);
})();
