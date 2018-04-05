// ==UserScript==
// @name         Rulu.co remove ads
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Removes ad links from Rulu.co
// @author       Adrien Pyke
// @match        *://www.rulu.co/*
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
})();
