// ==UserScript==
// @name         Youtube Scroll Volume
// @namespace    https://greasyfork.org/users/649
// @version      1.1.4
// @description  Use the scroll wheel to adjust volume of youtube videos
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://gitcdn.link/repo/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @require      https://gitcdn.link/repo/kufii/quick-query.js/2993f91ae90f3b2aff4af7e9ce0b08504f5c8060/dist/window/qq.js
// ==/UserScript==

(() => {
	'use strict';

	const { q } = window.QuickQuery;

	const Util = {
		bound: (num, min, max) => Math.max(Math.min(num, max), min)
	};

	const Config = GM_config([
		{ key: 'reverse', label: 'Reverse Scroll', default: false, type: 'bool' },
		{ key: 'step', label: 'Change By', default: 5, type: 'number', min: 1, max: 100 },
		{ key: 'hud', label: 'Display HUD', default: true, type: 'bool' },
		{ key: 'requireShift', label: 'Only handle scroll if holding "Shift" key', default: false, type: 'bool' }
	]);
	GM_registerMenuCommand('Youtube Scroll Volume Settings', Config.setup);

	let config = Config.load();
	Config.onsave = newConf => config = newConf;

	GM_addStyle(`
		.YSV_hud {
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			opacity: 0;
			transition: opacity 500ms ease 0s;
			z-index: 10;
			pointer-events: none;
		}
		.YSV_bar {
			background-color: #444;
			border: 2px solid white;
			width: 80%;
			max-width: 800px;
		}
		.YSV_progress {
			transition: width 100ms ease-out 0s;
			background-color: #888;
			height: 35px;
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

			const showHud = volume => {
				clearTimeout(id);
				progress.style.width = `${volume}%`;
				hud.style.opacity = 1;
				id = setTimeout(() => hud.style.opacity = 0, 800);
			};

			node.onwheel = e => {
				if(config.requireShift && !e.shiftKey) return;
				const player = node.getPlayer();
				const dir = (e.deltaY > 0 ? -1 : 1) * (config.reverse ? -1 : 1);

				const vol = Util.bound(player.getVolume() + (config.step * dir), 0, 100);
				player.setVolume(vol);
				if (vol > 0) player.unMute();
				if (config.hud) showHud(vol);

				e.preventDefault();
				e.stopImmediatePropagation();
			};
		}
	});
})();
