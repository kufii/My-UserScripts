// ==UserScript==
// @name         The Works Burger Chooser
// @namespace    https://greasyfork.org/users/649
// @version      1.2.2
// @description  Choose a random burger on the works menu
// @author       Adrien Pyke
// @match        *://worksburger.com/menu/burger-menu/*
// @grant        unsafeWindow
// ==/UserScript==

(() => {
	'use strict';

	let W = (typeof unsafeWindow === 'undefined') ? window : unsafeWindow;

	const SCRIPT_NAME = 'The Works Burger Chooser';

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
		randomColor() {
			let letters = '0123456789ABCDEF'.split('');
			let color = '#';
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * letters.length)];
			}
			return color;
		}
	};

	const selectBurger = function() {
		Util.log('Choosing Random Burger...');

		let burgers = Util.qq('.vc_grid-item-mini');
		burgers.forEach(burger => {
			burger.removeAttribute('style');
		});

		let burger = burgers[Math.floor(Math.random() * burgers.length)];

		Util.log(burger);

		burger.setAttribute('style', `
			transition: 0.5s;
			box-shadow: inset 0 0 100px ${Util.randomColor()};
			transform: scale(1.2, 1.2);
			border-radius: 20px;
		`);

		setTimeout(() => {
			burger.style.transform = 'scale(1, 1)';
		}, 500);

		burger.scrollIntoView();
	};

	if (W.BM_MODE) {
		selectBurger();
	} else {
		Util.log('Adding Button...');
		let button = document.createElement('button');
		button.textContent = 'Choose Random Burger';
		button.setAttribute('style', Util.css({
			'position': 'fixed',
			'bottom': '20px',
			'left': '20px',
			'padding': '5px',
			'z-index': 99999
		}));
		button.onclick = e => {
			e.stopImmediatePropagation();
			e.preventDefault();
			selectBurger();
		};
		document.body.appendChild(button);
	}
})();
