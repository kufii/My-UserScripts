// ==UserScript==
// @name         Prevent Wikia Ads
// @namespace    https://greasyfork.org/users/649
// @version      1.0.4
// @description  Prevent the ads that pop up when clicking a link to an external page on Wikias
// @author       Adrien Pyke
// @match        *://*.wikia.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_openInTab
// ==/UserScript==

(function() {
	'use strict';

	waitForElems({
		sel: 'a.exitstitial',
		onmatch: function(link) {
			link.onclick = function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				if (e.button === 0) {
					location.href = link.href;
				} else if (e.button === 1) {
					GM_openInTab(link.href, true);
				}
				return false;
			};
			link.onauxclick = link.onclick;
		}
	});
})();
