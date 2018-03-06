// ==UserScript==
// @name         userstyles.org - Auto Enable Source Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.0.1
// @description  auto enables the source editor on userstyle.org
// @author       Adrien Pyke
// @match        *://userstyles.org/styles/*/edit*
// @match        *://userstyles.org/styles/new*
// @grant        none
// ==/UserScript==

(() => {
	'use strict';

	document.querySelector('#enable-source-editor-code').click();
})();
