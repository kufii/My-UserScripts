// ==UserScript==
// @name         SoundCloud Toggle Continuous Play and Autoplay
// @namespace    https://greasyfork.org/users/649
// @version      1.1.20
// @description  Adds options to toggle continuous play and autoplay in SoundCloud
// @author       Adrien Pyke
// @match        *://soundcloud.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://gitcdn.link/repo/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
	'use strict';

	const SCRIPT_NAME = 'SoundCloud Toggle Continuous Play and Autoplay';

	const Util = {
		log(...args) {
			args.unshift(`%c${SCRIPT_NAME}:`, 'font-weight: bold;color: #233c7b;');
			console.log(...args);
		},
		q(query, context = document) {
			return context.querySelector(query);
		},
		qq(query, context = document) {
			return Array.from(context.querySelectorAll(query));
		},
		createCheckbox(lbl) {
			const label = document.createElement('label');
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			label.appendChild(checkbox);
			label.appendChild(document.createTextNode(lbl));
			return label;
		}
	};

	const Config = GM_config([
		{
			key: 'autoplay',
			label: 'Autoplay',
			default: false,
			type: 'bool'
		}, {
			key: 'continuousPlay',
			label: 'Continuous Play',
			default: false,
			type: 'bool'
		}
	]);
	GM_registerMenuCommand('SoundCloud Autoplay', Config.setup);


	const App = {
		playButton: Util.q('.playControl'),
		isPlaying() {
			return App.playButton.classList.contains('playing');
		},
		pause() {
			if (App.isPlaying()) {
				App.playButton.click();
			}
		},
		play() {
			if (!App.isPlaying()) {
				App.playButton.click();
			}
		},
		getPlaying() {
			const link = Util.q('a.playbackSoundBadge__title');
			if (link) {
				return link.href;
			}
			return null;
		},
		addAutoplayControl() {
			const container = Util.q('.playControls__inner');
			const label = Util.createCheckbox('Autoplay');
			label.setAttribute('style', 'position: absolute; bottom: 0; right: 0; z-index: 1;');
			container.appendChild(label);
			const check = Util.q('input', label);
			check.checked = Config.load().continuousPlay;
			check.onchange = () => {
				const cfg = Config.load();
				cfg.continuousPlay = check.checked;
				Config.save(cfg);
			};
			return check;
		}
	};

	// disable autoplay
	if (!Config.load().autoplay) {
		App.pause();
	}

	const autoplayControl = App.addAutoplayControl();
	let current = App.getPlaying();
	let timeout;
	// every time the song changes
	waitForElems({
		context: Util.q('.playControls__soundBadge'),
		onchange() {
			const next = App.getPlaying();
			if (!autoplayControl.checked && current && next !== current) {
				timeout = setTimeout(() => {
					Util.log('Pausing...');
					App.pause();
				}, 0);
			}
			current = next;
		}
	});

	// override the click event for elements that shouldn't trigger a pause
	waitForElems({
		sel: '.skipControl, .playButton, .compactTrackList__item, .fullListenHero__foreground',
		onmatch(elem) {
			elem.addEventListener('click', () => {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
			});
		}
	});

	// waveforms need to be handled differently
	waitForElems({
		sel: '.waveform__layer',
		onmatch(elem) {
			elem.addEventListener('click', () => {
				setTimeout(() => {
					if (!App.isPlaying()) {
						Util.log('Playing via Waveform');
						App.play();
					}
				}, 0);
			});
		}
	});

	// fix for buttons constantly showing buffering
	waitForElems({
		sel: '.sc-button-buffering',
		onmatch(button) {
			if (!App.isPlaying()) {
				button.classList.remove('sc-button-buffering');
				button.title = button.textContent = 'Play';
			}
		}
	});
})();
