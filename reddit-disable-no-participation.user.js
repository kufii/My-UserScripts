// ==UserScript==
// @name         Reddit Disable No Participation
// @namespace    https://greasyfork.org/users/649
// @version      1.0.2
// @description  Disables No Participation on Reddit
// @author       Adrien Pyke
// @match        *://*.reddit.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	var MATCH = /^https?:\/\/np\.reddit\.com/i;
	var REPLACE = {
		regex: /^(https?:\/\/)np(.+)/i,
		replaceWith: '$1www$2'
	};

	if (location.href.match(MATCH)) {
		location.replace(location.href.replace(REPLACE.regex, REPLACE.replaceWith));
	}

	document.addEventListener('DOMContentLoaded', function() {
		waitForElems({
			sel: 'a',
			onmatch: function(link) {
				if (link.href.match(MATCH)) {
					link.href = link.href.replace(REPLACE.regex, REPLACE.replaceWith);
				}
			}
		});
	});
})();
