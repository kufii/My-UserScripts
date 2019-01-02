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
	
	let config = Config.load();
	Config.onsave = newConf => config = newConf;
	
	const shakeAnim = 'YSV_shake';

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
			background-color: #888;
			border: 2px solid white;
			width: 80%;
			max-width: 800px;
		}
		.YSV_progress {
			transition: width 250ms ease-out 0s;
			background-color: #444;
			height: 35px;
		}
		.${shakeAnim} {
			animation: ${shakeAnim} 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
		}
		@keyframes ${shakeAnim} {
			10%, 90% {
				transform: translate3d(-1px, 0, 0);
			}
			20%, 80% {
				transform: translate3d(2px, 0, 0);
			}
			30%, 50%, 70% {
				transform: translate3d(-4px, 0, 0);
			}
			40%, 60% {
				transform: translate3d(4px, 0, 0);
			}
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
				const dir = (e.deltaY > 0 ? -1 : 1) * (config.reverse ? -1 : 1);

				const lastVol = player.getVolume();
				const vol = Util.bound(lastVol + (config.step * dir), 0, 100);
				player.setVolume(vol);
				if (vol > 0) player.unMute();
							
				const bar = hud.firstChild;
				if (lastVol === vol) bar.classList.add(shakeAnim);
				else bar.classList.remove(shakeAnim);

				clearTimeout(id);
				progress.style.width = `${vol}%`;
				hud.style.opacity = 1;
				id = setTimeout(() => {
					hud.style.opacity = 0;
					bar.classList.remove(shakeAnim);
				}, 800);

				e.preventDefault();
				e.stopImmediatePropagation();
			};
		}
	});
})();
