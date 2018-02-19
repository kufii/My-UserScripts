// ==UserScript==
// @name         Youtube Unblocker
// @namespace    https://greasyfork.org/users/649
// @version      2.0.2
// @description  Auto redirects blocked videos to the mirror site eachvideo.com
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @match        *://eachvideo.com/watch*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
	'use strict';

	var Config = {
		load: function() {
			var defaults = {
				autoplay: true
			};

			var cfg = GM_getValue('cfg');
			if (!cfg) return defaults;

			cfg = JSON.parse(cfg);
			for (var property in defaults) {
				if (defaults.hasOwnProperty(property)) {
					if (typeof cfg[property] === 'undefined') {
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

			var createCheckbox = function(lbl, checked) {
				var label = document.createElement('label');
				var checkbox = document.createElement('input');
				checkbox.setAttribute('type', 'checkbox');
				label.appendChild(checkbox);
				label.appendChild(document.createTextNode(lbl));
				checkbox = label.querySelector('input');
				checkbox.checked = checked;
				return label;
			};

			var createButton = function(text, onclick) {
				var button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};

			var createLineBreak = function() {
				return document.createElement('br');
			};

			var init = function(cfg) {
				var div = createContainer();

				var autoplay = createCheckbox('autoplay', cfg.autoplay);
				div.appendChild(autoplay);

				div.appendChild(createLineBreak());

				div.appendChild(createButton('Save', function(e) {
					var settings = {
						autoplay: autoplay.querySelector('input').checked
					};
					Config.save(settings);
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
	GM_registerMenuCommand('Youtube Unblocker Settings', Config.setup);

	if (location.hostname === 'www.youtube.com') {
		waitForElems({
			sel: '.ytd-playability-error-supported-renderers',
			onmatch: function() {
				location.replace(location.protocol + '//eachvideo.com/watch' + location.search);
			}
		});
	} else {
		var cfg = Config.load();
		if (!cfg.autoplay) {
			document.querySelector('.vjs-play-control').click();
		}
		waitForElems({
			sel: 'body.modal-open #admodelbox',
			stop: true,
			onmatch: function(ad) {
				ad.querySelector('.close').click();
			}
		});
	}
})();
