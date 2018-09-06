// ==UserScript==
// @name         Greasy Fork - Auto Enable Syntax-Highlighting Source Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.1.2
// @description  Auto enables greasy fork's syntax-highlighting source editor
// @author       Adrien Pyke
// @match        *://greasyfork.org/*/script_versions/new*
// @match        *://greasyfork.org/*/scripts/*/versions/new*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/89e64ca31aa4c27ce8bc68a84ffac53e06f074c0/wait-for-elements/wait-for-elements.js
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
