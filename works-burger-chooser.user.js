// ==UserScript==
// @name         The Works Burger Chooser
// @namespace    https://greasyfork.org/users/649
// @version      1.0.1
// @description  Choose a random burger on the works menu
// @author       Adrien Pyke
// @match        *://www.worksburger.com/Menu/Burger-Menu.aspx*
// @grant        unsafeWindow
// ==/UserScript==

(function() {
	'use strict';

	var W = (typeof unsafeWindow === 'undefined') ? window : unsafeWindow;

	var SCRIPT_NAME = 'The Works Burger Chooser';

	var Util = {
		log: function () {
			var args = [].slice.call(arguments);
			args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');
			console.log.apply(console, args);
		},
		q: function(query, context) {
			return (context || document).querySelector(query);
		},
		qq: function(query, context) {
			return [].slice.call((context || document).querySelectorAll(query));
		},
		css: function(css) {
			var out = '';
			for (var rule in css) {
				out += rule + ':' + css[rule] + '!important;';
			}
			return out;
		},
		prepend: function(parent, child) {
			parent.insertBefore(child, parent.firstChild);
		},
		randomColor: function() {
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * letters.length)];
			}
			return color;
		}
	};

	var selectBurger = function() {
		Util.log('Choosing Random Burger...');

		var burgers = Util.qq('.burger-block');
		burgers.forEach(function(burger) {
			burger.removeAttribute('style');
			var img = Util.q('img', burger);
			img.src = img.dataset.original;
		});

		var burger = burgers[Math.floor(Math.random() * burgers.length)];

		burger.setAttribute('style', Util.css({
			'transition': '.5s',
			'box-shadow': 'inset 0 0 100px ' + Util.randomColor(),
			'transform': 'scale(1.2, 1.2)',
			'border-radius': '20px'
		}));

		setTimeout(function() {
			burger.style.transform = 'scale(1, 1)';
		}, 500);

		W.scroll(0, burger.offsetTop);
	};

	if (W.BM_MODE) {
		selectBurger();
	} else {
		Util.log('Adding Button...');
		var button = document.createElement('button');
		button.textContent = 'Choose Random Burger';
		button.setAttribute('style', Util.css({
			'position': 'fixed',
			'bottom': '20px',
			'left': '20px',
			'padding': '5px',
			'z-index': 99999
		}));
		button.onclick = function(e) {
			e.stopImmediatePropagation();
			e.preventDefault();
			selectBurger();
		};
		document.body.appendChild(button);
	}
})();
