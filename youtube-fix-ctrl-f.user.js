// ==UserScript==
// @name         Youtube Fix Ctrl+F
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Stops youtube from going into fullscreen when you press Ctrl+F
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	window.addEventListener('keydown', function(e) {
		if (e.keyCode === 70 && e.ctrlKey) {
			e.stopImmediatePropagation();
		}
	}, true);
})();
