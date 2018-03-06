// ==UserScript==
// @name         Cubemania - Auto Select Inspection
// @namespace    https://greasyfork.org/users/649
// @version      1.0.1
// @description  auto checkes the 15 second inspection checkbox on the cubemania timer
// @author       Adrien Pyke
// @match        *://www.cubemania.org/puzzles/*/timer
// @grant        none
// ==/UserScript==

(() => {
	'use strict';

	document.querySelector('input.inspection-toggle').click();
})();
