// ==UserScript==
// @name         Greasy Fork - Auto Enable Syntax-Highlighting Source Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.0.2
// @description  Auto enables greasy fork's syntax-highlighting source editor
// @author       Adrien Pyke
// @match        *://greasyfork.org/*/script_versions/new*
// @match        *://greasyfork.org/*/scripts/*/versions/new*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	waitForElems({
		sel: '#enable-source-editor-code',
		stop: true,
		onmatch: function(checkbox) {
			checkbox.click();
		}
	});
})();
