// ==UserScript==
// @name         Youtube Scroll Volume
// @namespace    https://greasyfork.org/users/649
// @version      1.1.0
// @description  Use the scroll wheel to adjust volume of youtube videos
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://gitcdn.link/repo/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @require      https://gitcdn.link/repo/fuzetsu/e1fdc6ebf5ab65819d1933e3c1d85bea/raw/07d30af7c23311f1f2600d05bc73eadbd0219cfd/qq.js
// ==/UserScript==

(() => {
	'use strict';

	const { q } = window.QuickQuery;

	const Util = {
		bound: (num, min, max) => Math.max(Math.min(num, max), min)
	};

	const Config = GM_config([
		{ key: 'reverse', label: 'Reverse Scroll', default: false, type: 'bool' },
		{ key: 'step', label: 'Change By', default: 5, type: 'number', min: 1, max: 100 }
	]);
	GM_registerMenuCommand('Youtube Scroll Volume Settings', Config.setup);

	GM_addStyle(`
		.YSV_hud {
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			top: 0;
			bottom: 0;
			left: 10%;
			right: 10%;
			opacity: 0;
			transition: opacity 500ms ease 0s;
			z-index: 10;
			pointer-events: none;
		}
		.YSV_hud .YSV_bar {
			display: block;
			background-color: #888;
			border: 1px solid black;
			width: 100%;
		}
		.YSV_hud .YSV_bar .YSV_progress {
			display: block;
			background-color: #444;
			height: 20px;
		}
	`);

	const createHud = () => {
		const hud = document.createElement('div');
		hud.classList.add('YSV_hud');
		hud.innerHTML = '<div class="YSV_bar"><div class="YSV_progress"></div></div>';
		return hud;
	};

	waitForElems({
		sel: 'ytd-player',
		onmatch(node) {
			let id;

			const hud = createHud();
			const progress = q(hud).q('.YSV_progress');
			node.appendChild(hud);

			node.onwheel = e => {
				const player = node.getPlayer();
				const config = Config.load();
				const dir = (e.deltaY > 0 ? -1 : 1) * (config.reverse ? -1 : 1);

				const vol = Util.bound(player.getVolume() + (config.step * dir), 0, 100);
				player.setVolume(vol);
				if (vol > 0) player.unMute();

				clearTimeout(id);
				progress.style.width = `${vol}%`;
				hud.style.opacity = 1;
				id = setTimeout(() => hud.style.opacity = 0, 800);

				e.preventDefault();
				e.stopImmediatePropagation();
			};
		}
	});
})();
