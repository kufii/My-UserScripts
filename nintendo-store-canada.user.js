// ==UserScript==
// @name         Nintendo Store Canada
// @namespace    https://greasyfork.org/users/649
// @version      1.0.2
// @description  Auto redirect nintendo store to canada store
// @author       Adrien Pyke
// @match        https://store.nintendo.com/ng3/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
	'use strict';

	if (!location.href.match(/\/ca\//i)) {
		if (location.href.match(/\/us\//i)) {
			location.replace(location.href.replace(/\/us\//i, '/ca/'));
		} else {
			location.replace(location.href.replace(/\/ng3/i, '/ng3/ca/po'));
		}
	}
})();
