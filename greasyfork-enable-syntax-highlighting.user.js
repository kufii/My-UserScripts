// ==UserScript==
// @name         Greasy Fork - Auto Enable Syntax-Highlighting Source Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.1.4
// @description  Auto enables greasy fork's syntax-highlighting source editor
// @author       Adrien Pyke
// @match        *://greasyfork.org/*/script_versions/new*
// @match        *://greasyfork.org/*/scripts/*/versions/new*
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @grant        none
// ==/UserScript==

(() => {
	'use strict';

	waitForElems({
		sel: '#enable-source-editor-code',
		stop: true,
		onmatch(checkbox) {
			checkbox.click();
		}
	});
})();
