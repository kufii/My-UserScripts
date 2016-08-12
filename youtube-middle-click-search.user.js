// ==UserScript==
// @name         Youtube Middle Click Search
// @namespace    https://greasyfork.org/users/649
// @version      1.4.6
// @description  Middle clicking the search on youtube opens the results in a new tab
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        GM_openInTab
// ==/UserScript==

(function() {
	'use strict';

	console.log('started YMCS');
	var processBtn = function(element) {
		console.log('found search button');
		// setup references
		var oldButton = document.querySelector('#search-btn'),
			button = document.createElement('button'),
			input = document.querySelector('#masthead-search-term'),
			initSearch = input.value.trim();
		// imitate old button style
		button.appendChild(oldButton.firstChild.cloneNode(true));
		button.firstChild.style.margin = '0 25px';
		button.style.padding = '0';
		button.className = oldButton.className;
		button.setAttribute('type', 'button');
		// insert new button and hide old (as opposed to remove, removing was conflicting with another script I use)
		oldButton.parentNode.insertBefore(button, oldButton.nextSibling);
		oldButton.style.display = 'none';
		// bind events
		button.onmousedown = function(e) {
			if (e.button === 1) {
				e.preventDefault();
			}
		};
		button.onclick = function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			if (input.value.trim() === '' || input.value.trim() === initSearch && e.button !== 1) return false;
			var url = location.origin + '/results?search_query=' + encodeURIComponent(input.value);
			if (e.button === 1) {
				console.log('opening');
				GM_openInTab(url, true);
			} else if(e.button === 0) {
				window.location.href = url;
			}
			return false;
		};
	};

	var processResults = function() {
		var elements = document.querySelectorAll('.gssb_e .gsq_a');
		[].forEach.call(elements, function (element) {
			if (element) {
				element.onmousedown =  function(e) {
					if (e.button === 1) {
						e.preventDefault();
					}
				};
				element.onclick = function(e) {
					var url = location.origin + '/results?search_query=' + encodeURIComponent(element.querySelector('span').textContent);
					if (e.button === 1) {
						console.log('opening');
						GM_openInTab(url, true);
					} else if(e.button === 0) {
						window.location.href = url;
					}
					e.preventDefault();
					return false;
				};
			}
		});
	};

	waitForElems('#search-btn', processBtn, true);
	waitForElems('.gssb_e', function(table) {
		var tick = new MutationObserver(processResults);
		tick.observe(table, { subtree: true, childList: true, attributes: true });
	});
})();
