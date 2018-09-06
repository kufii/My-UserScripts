// ==UserScript==
// @name         New reddit: Prevent middle click scroll
// @namespace    https://greasyfork.org/users/649
// @version      1.0.5
// @description  Prevents the middle click scroll when middle clicking posts on the new reddit layout
// @author       Adrien Pyke
// @match        *://*.reddit.com/*
// @grant        GM_openInTab
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/89e64ca31aa4c27ce8bc68a84ffac53e06f074c0/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
	'use strict';

	const Util = {
		q(query, context = document) {
			return context.querySelector(query);
		},
		qq(query, context = document) {
			return Array.from(context.querySelectorAll(query));
		}
	};

	const mousedown = e => {
		if (e.button === 1) return false;
	};

	waitForElems({
		sel: '.Post',
		onmatch(post) {
			post.onmousedown = mousedown;

			const links = Util.qq('a[data-click-id="comments"]', post);
			if (links.length) {
				const link = links[links.length - 1];
				if (link) {
					post.onclick = post.onauxclick = e => {
						if (e.button === 1 && e.target.tagName !== 'A' && e.target.parentNode.tagName !== 'A') {
							e.preventDefault();
							e.stopImmediatePropagation();
							GM_openInTab(link.href, true);
						}
					};
				}
			}
		}
	});
})();
