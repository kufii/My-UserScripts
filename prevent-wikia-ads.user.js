// ==UserScript==
// @name         Prevent Wikia Ads
// @namespace    https://greasyfork.org/users/649
// @version      1.0.6
// @description  Prevent the ads that pop up when clicking a link to an external page on Wikias
// @author       Adrien Pyke
// @match        *://*.wikia.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/89e64ca31aa4c27ce8bc68a84ffac53e06f074c0/wait-for-elements/wait-for-elements.js
// @grant        GM_openInTab
// ==/UserScript==

(() => {
	'use strict';

	waitForElems({
		sel: 'a.exitstitial',
		onmatch(link) {
			link.onclick = e => {
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
