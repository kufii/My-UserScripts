// ==UserScript==
// @name         Hummingbird Default Japanese Cast
// @namespace    https://greasyfork.org/users/649
// @version      1.2.3
// @description  Cast on anime pages defaults to Japanese
// @author       Adrien Pyke
// @match        *://hummingbird.me/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	waitForUrl(/^https?:\/\/hummingbird\.me\/anime\/[^\/]+\/?(?:\?.*)?$/, function() {
		waitForElems('#dropdownMenu1', function(dropdown) {
			if (dropdown.textContent.trim() !== 'Japanese') {
				var japaneseButton = [].filter.call(document.querySelectorAll('.cast-language .dropdown-menu li a'), function(elem) {
					return elem.textContent.trim() === 'Japanese';
				});
				if (japaneseButton.length > 0) {
					japaneseButton[0].click();
				}
			}
		}, true);
	});
})();
