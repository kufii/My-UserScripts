// ==UserScript==
// @name         Dailymotion disable autoplay
// @namespace    https://greasyfork.org/users/649
// @version      1.1.1
// @description  Disables autoplay and auto next vid on dailmotion
// @author       Adrien Pyke
// @match        *://www.dailymotion.com/video/*
// @grant        none
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

	waitForElems({
		sel: 'body.has-skyscraper',
		stop: true,
		context: document,
		onmatch() {
			Util.q('.dmp_PlaybackButton').click();
		}
	});

	waitForElems({
		sel: '.dmp_ComingUpEndScreen:not(.dmp_is-hidden) .dmp_ComingUpEndScreen-cancel',
		stop: true,
		onmatch(cancel) {
			cancel.click();
		}
	});
})();
