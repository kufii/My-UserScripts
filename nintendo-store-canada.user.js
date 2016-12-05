// ==UserScript==
// @name         Nintendo Store Canada
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Auto redirect nintendo store to canada store
// @author       Adrien Pyke
// @match        https://store.nintendo.com/ng3/us/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
	'use strict';

	location.replace(location.href.replace(/\/us\//i, '/ca/'));
})();
