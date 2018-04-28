// ==UserScript==
// @name         Reddit Flair Linkifier
// @namespace    https://greasyfork.org/users/649
// @version      2.0.2
// @description  Turns the text in various subreddits' flair into links
// @author       Adrien Pyke
// @match        *://*.reddit.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_addStyle
// ==/UserScript==

(() => {
	'use strict';

	GM_addStyle(`
		.flair-link {
			text-decoration: none;
		}
		.flair-link:hover {
			text-decoration: underline;
		}
	`);

	waitForElems({
		sel: [
			// old reddit
			'span.flair',

			// card template
			'.Post > div:nth-of-type(2) > div:nth-of-type(1) > div > div:nth-of-type(1) > div:nth-of-type(2) > span',
			'.Post > div:nth-of-type(2) > article > div:nth-of-type(1) > div:nth-of-type(1) > div > div:nth-of-type(1) > div:nth-of-type(2) > span',
			// classic template
			'.Post > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > span',
			// compact template
			'.Post > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > span',

			// comments
			'.Comment > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > span',

			// moderators
			'.cIMsMe > div > span',

			// user flair preview
			'.QAshv > div > span',

			// flair edit
			'.fhMwuu > div > span'
		].join(','),
		onmatch(flair) {
			flair.innerHTML = flair.textContent.split(' ').map(segment => {
				if (segment.match(/^https?:\/\//)) {
					return `<a href="${segment}" class="flair-link" target="_blank" rel="noopener noreferrer">${segment}</a>`;
				} else {
					return segment;
				}
			}).join(' ');
		}
	});
})();
