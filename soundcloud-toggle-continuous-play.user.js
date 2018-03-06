// ==UserScript==
// @name         SoundCloud Toggle Continuous Play and Autoplay
// @namespace    https://greasyfork.org/users/649
// @version      1.1
// @description  Adds options to toggle continuous play and autoplay in SoundCloud
// @author       Adrien Pyke
// @match        *://soundcloud.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
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
			checkbox.setAttribute('type', 'checkbox');
			label.appendChild(checkbox);
			label.appendChild(document.createTextNode(lbl));
			return label;
		}
	};

	const Config = {
		load() {
			let defaults = {
				autoplay: false,
				continuousPlay: false
			};

			let cfg = GM_getValue('cfg');
			if (!cfg) return defaults;

			cfg = JSON.parse(cfg);
			for (let property in defaults) {
				if (defaults.hasOwnProperty(property)) {
					if (!cfg[property]) {
						cfg[property] = defaults[property];
					}
				}
			}

			return cfg;
		},

		save(cfg) {
			GM_setValue('cfg', JSON.stringify(cfg));
		},

		setup() {
			const createContainer = function() {
				let div = document.createElement('div');
				div.style.backgroundColor = 'white';
				div.style.padding = '5px';
				div.style.border = '1px solid black';
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.right = '0';
				div.style.zIndex = 99999;
				return div;
			};

			const createButton = function(text, onclick) {
				let button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};

			const createCheckbox = function(lbl, checked) {
				let label = Util.createCheckbox(lbl);
				let check = Util.q('input', label);
				check.checked = checked;
				return label;
			};

			const createLineBreak = function() {
				return document.createElement('br');
			};

			const init = function(cfg) {
				let div = createContainer();

				let autoplay = createCheckbox('Autoplay', cfg.autoplay);
				div.appendChild(autoplay);
				div.appendChild(createLineBreak());

				div.appendChild(createButton('Save', () => {
					cfg = Config.load();
					cfg.autoplay = Util.q('input', autoplay).checked;
					Config.save(cfg);
					div.remove();
				}));

				div.appendChild(createButton('Cancel', () => {
					div.remove();
				}));

				document.body.appendChild(div);
			};
			init(Config.load());
		}
	};
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
				button.setAttribute('title', 'Play');
				button.textContent = 'Play';
			}
		}
	});
})();
