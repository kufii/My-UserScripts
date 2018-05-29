// ==UserScript==
// @name         New reddit: Prevent middle click scroll
// @namespace    https://greasyfork.org/users/649
// @version      1.0.3
// @description  Prevents the middle click scroll when middle clicking posts on the new reddit layout
// @author       Adrien Pyke
// @match        *://*.reddit.com/*
// @grant        GM_openInTab
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
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

			const link = Util.q('a[data-click-id="comments"]', post);
			if (link) {
				post.onclick = post.onauxclick = e => {
					if (e.button === 1 && e.target.tagName !== 'A') {
						e.preventDefault();
						e.stopImmediatePropagation();
						GM_openInTab(link.href, true);
					}
				};
			}
		}
	});
})();
