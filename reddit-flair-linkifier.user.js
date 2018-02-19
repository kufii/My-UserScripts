// ==UserScript==
// @name         Reddit Flair Linkifier
// @namespace    https://greasyfork.org/users/649
// @version      1.1.5
// @description  Turns the text in various subreddits' flair into links
// @author       Adrien Pyke
// @match        *://*.reddit.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	waitForElems({
		sel: 'span.flair',
		onmatch: function(flair) {
			flair.innerHTML = flair.textContent.split(' ').map(function(segment) {
				if (segment.match(/^https?:\/\//)) {
					return '<a href="' + segment + '" target="_blank" rel="noopener noreferrer">' + segment + '</a>';
				} else {
					return segment;
				}
			}).join(' ');
		}
	});
})();
