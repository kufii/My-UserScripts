// ==UserScript==
// @name         Youtube Unblocker
// @namespace    https://greasyfork.org/users/649
// @version      3.0.1
// @description  Auto redirects blocked videos to the mirror site hooktube.com
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @match        *://hooktube.com/watch*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(() => {
	'use strict';

	const Config = {
		load() {
			let defaults = {
				autoplay: true
			};

			let cfg = GM_getValue('cfg');
			if (!cfg) return defaults;

			cfg = JSON.parse(cfg);
			Object.entries(defaults).forEach(([key, value]) => {
				if (typeof cfg[key] === 'undefined') {
					cfg[key] = value;
				}
			});

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

			const createCheckbox = function(lbl, checked) {
				let label = document.createElement('label');
				let checkbox = document.createElement('input');
				checkbox.setAttribute('type', 'checkbox');
				label.appendChild(checkbox);
				label.appendChild(document.createTextNode(lbl));
				checkbox = label.querySelector('input');
				checkbox.checked = checked;
				return label;
			};

			const createButton = function(text, onclick) {
				let button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};

			const createLineBreak = function() {
				return document.createElement('br');
			};

			const init = function(cfg) {
				let div = createContainer();

				let autoplay = createCheckbox('autoplay', cfg.autoplay);
				div.appendChild(autoplay);

				div.appendChild(createLineBreak());

				div.appendChild(createButton('Save', () => {
					let settings = {
						autoplay: autoplay.querySelector('input').checked
					};
					Config.save(settings);
					div.remove();
				}));

				div.appendChild(createButton('Cancel', () => div.remove()));

				document.body.appendChild(div);
			};
			init(Config.load());
		}
	};
	GM_registerMenuCommand('Youtube Unblocker Settings', Config.setup);

	if (location.hostname === 'www.youtube.com') {
		waitForElems({
			sel: '#page-manager',
			stop: true,
			onmatch(page) {
				setTimeout(() => {
					if (!page.innerHTML.trim() || page.querySelector('[player-unavailable]')) {
						location.replace(location.protocol + '//hooktube.com/watch' + location.search);
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
