// ==UserScript==
// @name         Reddit Flair Linkifier
// @namespace    https://greasyfork.org/users/649
// @version      2.0.7
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

	const newLayoutId = '#SHORTCUT_FOCUSABLE_DIV';
	const rightColSelector = `${newLayoutId} > div > div:first-of-type > div:last-of-type > div > div > div > div:last-of-type > div:last-of-type > div:last-of-type > div`;

	waitForElems({
		sel: [
			// old reddit
			'span.flair',
			'span.Comment__authorFlair',

			// card template
			`${newLayoutId} .Post > div:nth-of-type(2) > div:first-of-type > div > div:first-of-type > div:nth-of-type(2) > span`,
			`${newLayoutId} .Post > div:nth-of-type(2) > article > div:first-of-type > div:first-of-type > div > div:first-of-type > div:nth-of-type(2) > span`,
			// classic template
			`${newLayoutId} .Post > div:last-of-type > div > div:last-of-type > div:nth-of-type(2) > div:nth-of-type(2) > div:last-of-type > span`,
			// compact template
			`${newLayoutId} .Post > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > span`,

			// comments
			`${newLayoutId} .Comment > div:nth-of-type(2) > div:first-of-type > div:nth-of-type(2) > span`,

			// user profile comments
			`${newLayoutId} .Comment > div > div:last-of-type > div > div:first-of-type > div:first-of-type > div:nth-of-type(2) > span`,
			`${newLayoutId} .Comment > div > div:last-of-type > div > div:first-of-type > div:nth-of-type(2) > span`,

			// moderators
			`${rightColSelector} > div > div > div > div:first-of-type > div > div > span`,

			// user flair preview
			`${rightColSelector} > div:first-of-type > div:last-of-type > div:last-of-type > div > span`,

			// flair edit
			'body > div:last-of-type > div > div > div:nth-of-type(2) > div > span'
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
