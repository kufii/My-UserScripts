// ==UserScript==
// @name         Reddit Disable No Participation
// @namespace    https://greasyfork.org/users/649
// @version      1.0.7
// @description  Disables No Participation on Reddit
// @author       Adrien Pyke
// @match        *://*.reddit.com/*
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
	'use strict';

	const MATCH = /^https?:\/\/np\.reddit\.com/iu;
	const REPLACE = {
		regex: /^(https?:\/\/)np(.+)/iu,
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
