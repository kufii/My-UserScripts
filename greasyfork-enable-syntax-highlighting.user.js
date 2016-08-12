// ==UserScript==
// @name         Greasy Fork - Auto Enable Syntax-Highlighting Source Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.0.1
// @description  Auto enables greasy fork's syntax-highlighting source editor
// @author       Adrien Pyke
// @match        *://greasyfork.org/*/script_versions/new*
// @match        *://greasyfork.org/*/scripts/*/versions/new*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	waitForElems('#enable-source-editor-code', function(checkbox) {
		checkbox.click();
	}, true);
})();
