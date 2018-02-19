// ==UserScript==
// @name         SoundCloud Toggle Continuous Play and Autoplay
// @namespace    https://greasyfork.org/users/649
// @version      1.0.9
// @description  Adds options to toggle continuous play and autoplay in SoundCloud
// @author       Adrien Pyke
// @match        *://soundcloud.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'SoundCloud Toggle Continuous Play and Autoplay';

	var Util = {
		log: function() {
			var args = [].slice.call(arguments);
			args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');
			console.log.apply(console, args);
		},
		q: function(query, context) {
			return (context || document).querySelector(query);
		},
		qq: function(query, context) {
			return [].slice.call((context || document).querySelectorAll(query));
		},
		createCheckbox: function(lbl) {
			var label = document.createElement('label');
			var checkbox = document.createElement('input');
			checkbox.setAttribute('type', 'checkbox');
			label.appendChild(checkbox);
			label.appendChild(document.createTextNode(lbl));
			return label;
		}
	};

	var Config = {
		load: function() {
			var defaults = {
				autoplay: false,
				continuousPlay: false
			};

			var cfg = GM_getValue('cfg');
			if (!cfg) return defaults;

			cfg = JSON.parse(cfg);
			for (var property in defaults) {
				if (defaults.hasOwnProperty(property)) {
					if (!cfg[property]) {
						cfg[property] = defaults[property];
					}
				}
			}

			return cfg;
		},

		save: function(cfg) {
			GM_setValue('cfg', JSON.stringify(cfg));
		},

		setup: function() {
			var createContainer = function() {
				var div = document.createElement('div');
				div.style.backgroundColor = 'white';
				div.style.padding = '5px';
				div.style.border = '1px solid black';
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.right = '0';
				div.style.zIndex = 99999;
				return div;
			};

			var createButton = function(text, onclick) {
				var button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};

			var createCheckbox = function(lbl, checked) {
				var label = Util.createCheckbox(lbl);
				var check = Util.q('input', label);
				check.checked = checked;
				return label;
			};

			var createLineBreak = function() {
				return document.createElement('br');
			};

			var init = function(cfg) {
				var div = createContainer();

				var autoplay = createCheckbox('Autoplay', cfg.autoplay);
				div.appendChild(autoplay);
				div.appendChild(createLineBreak());

				div.appendChild(createButton('Save', function(e) {
					cfg = Config.load();
					cfg.autoplay = Util.q('input', autoplay).checked;
					Config.save(cfg);
					div.remove();
				}));

				div.appendChild(createButton('Cancel', function(e) {
					div.remove();
				}));

				document.body.appendChild(div);
			};
			init(Config.load());
		}
	};
	GM_registerMenuCommand('SoundCloud Autoplay', Config.setup);


	var App = {
		playButton: Util.q('.playControl'),
		isPlaying: function(e) {
			return App.playButton.classList.contains('playing');
		},
		pause: function() {
			if (App.isPlaying()) {
				App.playButton.click();
			}
		},
		play: function() {
			if (!App.isPlaying()) {
				App.playButton.click();
			}
		},
		getPlaying: function() {
			var link = Util.q('a.playbackSoundBadge__title');
			if (link) {
				return link.href;
			}
			return null;
		},
		addAutoplayControl: function() {
			var container = Util.q('.playControls__inner');
			var label = Util.createCheckbox('Autoplay');
			label.setAttribute('style', 'position: absolute; bottom: 0; right: 0; z-index: 1;');
			container.appendChild(label);
			var check = Util.q('input', label);
			check.checked = Config.load().continuousPlay;
			check.onchange = function(e) {
				var cfg = Config.load();
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

	var autoplayControl = App.addAutoplayControl();
	var current = App.getPlaying();
	var timeout;
	// every time the song changes
	waitForElems({
		context: Util.q('.playControls__soundBadge'),
		onchange: function() {
			var next = App.getPlaying();
			if (!autoplayControl.checked && current && next !== current) {
				timeout = setTimeout(function() {
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
		onmatch: function(elem) {
			elem.addEventListener('click', function(e) {
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
		onmatch: function(elem) {
			elem.addEventListener('click', function(e) {
				setTimeout(function() {
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
		onmatch: function(button) {
			if (!App.isPlaying()) {
				button.classList.remove('sc-button-buffering');
				button.setAttribute('title', 'Play');
				button.textContent = 'Play';
			}
		}
	});
})();
