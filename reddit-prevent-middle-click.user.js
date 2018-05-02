// ==UserScript==
// @name         New reddit: Prevent middle click scroll
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Prevents the middle click scroll when middle clicking posts on the new reddit layout
// @author       Adrien Pyke
// @match        url
// @grant        none
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
	'use strict';

	const mousedown = e => {
		if (e.button === 1) return false;
	};

	waitForElems({
		sel: '.Post',
		onmatch(post) {
			post.onmousedown = mousedown;
		}
	});
})();
