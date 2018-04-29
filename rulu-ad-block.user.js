// ==UserScript==
// @name         Rulu.co remove ads
// @namespace    https://greasyfork.org/users/649
// @version      1.0.1
// @description  Removes ad links from Rulu.co
// @author       Adrien Pyke
// @match        *://www.rulu.co/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        none
// ==/UserScript==

(() => {
	'use strict';

	const Util = {
		qq(query, context = document) {
			return Array.from(context.querySelectorAll(query));
		}
	};

	const REGEX = /^https?:\/\/rulu\.io\/j\//i;

	Util.qq('a')
		.filter(link => link.href.match(REGEX))
		.forEach(link => link.href = link.href.replace(REGEX, ''));

	waitForElems({
		sel: '#d0bf',
		onmatch(overlay) {
			overlay.remove();
		}
	});
})();
