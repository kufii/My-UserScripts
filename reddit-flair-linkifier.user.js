// ==UserScript==
// @name         Reddit Flair Linkifier
// @namespace    https://greasyfork.org/users/649
// @version      1.1.1
// @description  Turns the text in various subreddits' flair into links
// @author       Adrien Pyke
// @match        *://www.reddit.com/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	waitForElems('span.flair', function(flair) {
		flair.innerHTML = flair.textContent.split(' ').map(function(segment) {
			if (segment.match(/^https?:\/\//)) {
				return '<a href="' + segment + '" target="_blank">' + segment + '</a>';
			} else {
				return segment;
			}
		}).join(' ');
	});
})();
