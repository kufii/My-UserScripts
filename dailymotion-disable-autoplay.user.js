// ==UserScript==
// @name         Dailymotion disable autoplay
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Disables autoplay and auto next vid on dailmotion
// @author       Adrien Pyke
// @match        *://www.dailymotion.com/video/*
// @grant        none
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// ==/UserScript==

(function() {
	'use strict';

	var Util = {
		q: function(query, context) {
			return (context || document).querySelector(query);
		},
		qq: function(query, context) {
			return [].slice.call((context || document).querySelectorAll(query));
		}
	};

	waitForElems({
		sel: 'body.has-skyscraper',
		stop: true,
		context: document,
		onmatch: function() {
			Util.q('.dmp_PlaybackButton').click();
		}
	});

	waitForElems({
		sel: '.dmp_ComingUpEndScreen:not(.dmp_is-hidden) .dmp_ComingUpEndScreen-cancel',
		stop: true,
		onmatch: function(cancel) {
			cancel.click();
		}
	});
})();
