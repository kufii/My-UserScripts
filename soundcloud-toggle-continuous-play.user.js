// ==UserScript==
// @name         SoundCloud Toggle Continuous Play and Autoplay
// @namespace    https://greasyfork.org/users/649
// @version      1.1.14
// @description  Adds options to toggle continuous play and autoplay in SoundCloud
// @author       Adrien Pyke
// @match        *://soundcloud.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/4ce99f3afbf6c6edaa21bacc2981204582a20522/libs/gm_config.js
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
	'use strict';

	let SCRIPT_NAME = 'SoundCloud Toggle Continuous Play and Autoplay';

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
			let label = document.createElement('label');
			let checkbox = document.createElement('input');
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
			let link = Util.q('a.playbackSoundBadge__title');
			if (link) {
				return link.href;
			}
			return null;
		},
		addAutoplayControl() {
			let container = Util.q('.playControls__inner');
			let label = Util.createCheckbox('Autoplay');
			label.setAttribute('style', 'position: absolute; bottom: 0; right: 0; z-index: 1;');
			container.appendChild(label);
			let check = Util.q('input', label);
			check.checked = Config.load().continuousPlay;
			check.onchange = () => {
				let cfg = Config.load();
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

	let autoplayControl = App.addAutoplayControl();
	let current = App.getPlaying();
	let timeout;
	// every time the song changes
	waitForElems({
		context: Util.q('.playControls__soundBadge'),
		onchange() {
			let next = App.getPlaying();
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
