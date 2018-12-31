// ==UserScript==
// @name         Youtube Scroll Volume
// @namespace    https://greasyfork.org/users/649
// @version      1.0.0
// @description  Use the scroll wheel to adjust volume of youtube videos
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://gitcdn.link/repo/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
	'use strict';

	const Config = GM_config([
		{ key: 'reverse', label: 'Reverse Scroll', default: false, type: 'bool' },
		{ key: 'step', label: 'Change By', default: 5, type: 'number', min: 1, max: 100 }
	]);
	GM_registerMenuCommand('Youtube Scroll Volume Settings', Config.setup);

	waitForElems({
		sel: 'ytd-player',
		onmatch(node) {
			node.onwheel = e => {
				const player = node.getPlayer();
				const config = Config.load();
				const dir = (e.deltaY > 0 ? -1 : 1) * (config.reverse ? -1 : 1);

				const vol = player.getVolume() + (config.step * dir);
				player.setVolume(vol);
				if (vol > 0) player.unMute();

				e.preventDefault();
				e.stopImmediatePropagation();
			};
		}
	});
})();
