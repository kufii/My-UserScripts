// ==UserScript==
// @name         Youtube Unblocker
// @namespace    https://greasyfork.org/users/649
// @version      3.0.11
// @description  Auto redirects blocked videos to the mirror site hooktube.com
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @match        *://hooktube.com/watch*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/b10b92306f4e03b4b0af507db61fd908d0e42669/libs/gm_config.js
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

	const Config = GM_config([
		{
			key: 'autoplay',
			label: 'Autoplay',
			default: true,
			type: 'bool'
		}
	]);
	GM_registerMenuCommand('Youtube Unblocker Settings', Config.setup);

	if (location.hostname === 'www.youtube.com') {
		waitForElems({
			sel: '#page-manager',
			stop: true,
			onmatch(page) {
				setTimeout(() => {
					const redirect = function() {
						location.replace(`${location.protocol}//hooktube.com/watch${location.search}`);
					};
					if (page.querySelector('[player-unavailable]')) {
						redirect();
					} else {
						setTimeout(() => {
							if (!Util.q('#page-manager').innerHTML.trim()) {
								redirect();
							}
						}, 5);
					}
				}, 0);
			}
		});
	} else {
		let cfg = Config.load();
		if (!cfg.autoplay) {
			waitForElems({
				sel: '#player-obj',
				stop: true,
				onmatch(video) {
					video.pause();
				}
			});
			document.querySelector('#player-obj').pause();
		}
	}
})();
