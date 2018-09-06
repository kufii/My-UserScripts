// ==UserScript==
// @name         Rulu.co remove ads
// @namespace    https://greasyfork.org/users/649
// @version      1.0.2
// @description  Removes ad links from Rulu.co
// @author       Adrien Pyke
// @match        *://www.rulu.co/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/89e64ca31aa4c27ce8bc68a84ffac53e06f074c0/wait-for-elements/wait-for-elements.js
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
