// ==UserScript==
// @name         Reddit Disable No Participation
// @namespace    https://greasyfork.org/users/649
// @version      1.0.4
// @description  Disables No Participation on Reddit
// @author       Adrien Pyke
// @match        *://*.reddit.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/89e64ca31aa4c27ce8bc68a84ffac53e06f074c0/wait-for-elements/wait-for-elements.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
	'use strict';

	const MATCH = /^https?:\/\/np\.reddit\.com/i;
	const REPLACE = {
		regex: /^(https?:\/\/)np(.+)/i,
		replaceWith: '$1www$2'
	};

	if (location.href.match(MATCH)) {
		location.replace(location.href.replace(REPLACE.regex, REPLACE.replaceWith));
	}

	document.addEventListener('DOMContentLoaded', () => {
		waitForElems({
			sel: 'a',
			onmatch(link) {
				if (link.href.match(MATCH)) {
					link.href = link.href.replace(REPLACE.regex, REPLACE.replaceWith);
				}
			}
		});
	});
})();
