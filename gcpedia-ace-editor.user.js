// ==UserScript==
// @name         GCPedia Ace Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.1.8
// @description  Use the Ace Editor when editing things on GCPedia
// @author       Adrien Pyke
// @match        http://www.gcpedia.gc.ca/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'GCPedia Ace Editor';

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
		addScript: function(src, onload) {
			var s = document.createElement('script');
			s.onload = onload;
			s.src = src;
			document.body.appendChild(s);
		},
		addScriptText: function(code, onload) {
			var s = document.createElement('script');
			s.onload = onload;
			s.textContent = code;
			document.body.appendChild(s);
		},
		appendStyle: function(css) {
			var out = '';
			for (var selector in css) {
				out += selector + '{';
				for (var rule in css[selector]) {
					out += rule + ':' + css[selector][rule] + '!important;';
				}
				out += '}';
			}

			var style = document.createElement('style');
			style.type = 'text/css';
			style.appendChild(document.createTextNode(out));
			document.head.appendChild(style);
		},
		appendAfter: function(elem, elemToAppend) {
			elem.parentNode.insertBefore(elemToAppend, elem.nextElementSibling);
		}
	};

	var Config = {
		load: function() {
			var defaults = {
				theme: 'monokai'
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

		setup: function(editor) {
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

			var createSelect = function(label, options, value) {
				var select = document.createElement('select');
				select.style.margin = '2px';
				var optgroup = document.createElement('optgroup');
				if (label) {
					optgroup.setAttribute('label', label);
				}
				select.appendChild(optgroup);
				options.forEach(function(opt) {
					var option = document.createElement('option');
					option.setAttribute('value', opt);
					option.textContent = opt;
					optgroup.appendChild(option);
				});
				select.value = value;
				return select;
			};

			var createButton = function(text, onclick) {
				var button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};

			var createLabel = function(label) {
				var lbl = document.createElement('span');
				lbl.textContent = label;
				return lbl;
			};

			var createLineBreak = function() {
				return document.createElement('br');
			};

			var init = function(cfg) {
				var div = createContainer();

				var theme = createSelect('Theme', [
						'ambiance',
						'chaos',
						'chrome',
						'clouds',
						'clouds_midnight',
						'cobalt',
						'crimson_editor',
						'dawn',
						'dreamweaver',
						'eclipse',
						'github',
						'gob',
						'gruvbox',
						'idle_fingers',
						'iplastic',
						'katzenmilch',
						'kr_theme',
						'kuroir',
						'merbivore',
						'merbivore_soft',
						'mono_industrial',
						'monokai',
						'pastel_on_dark',
						'solarized_dark',
						'solarized_light',
						'sqlserver',
						'terminal',
						'textmate',
						'tomorrow',
						'tomorrow_night',
						'tomorrow_night_blue',
						'tomorrow_night_bright',
						'tomorrow_night_eighties',
						'twilight',
						'vibrant_ink',
						'xcode'
					], cfg.theme);
				div.appendChild(createLabel('Theme: '));
				div.appendChild(theme);
				div.appendChild(createLineBreak());

				theme.onchange = function() {
					editor.setTheme('ace/theme/' + theme.value);
				};

				div.appendChild(createButton('Save', function(e) {
					var settings = {
						theme: theme.value
					};
					Config.save(settings);
					div.remove();
				}));

				div.appendChild(createButton('Cancel', function(e) {
					editor.setTheme('ace/theme/' + cfg.theme);
					div.remove();
				}));

				document.body.appendChild(div);
			};
			init(Config.load());
		}
	};

	waitForElems({
		sel: '#wpTextbox1',
		stop: true,
		onmatch: function(textArea) {
			var wrapper = document.createElement('div');
			wrapper.id = 'ace';
			wrapper.textContent = textArea.value;

			Util.appendAfter(textArea, wrapper);

			Util.appendStyle({
				'.ace_editor': {
					height: '600px'
				},
				'.wikiEditor-ui, #wpTextbox1': {
					display: 'none'
				}
			});
			Util.addScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ace.js', function() {
				var editor = unsafeWindow.ace.edit('ace');
				editor.setTheme('ace/theme/' + Config.load().theme);
				editor.getSession().setMode('ace/mode/html');
				editor.resize();

				unsafeWindow.aceEditor = editor;
				unsafeWindow.originalTextArea = textArea;

				Util.addScriptText("aceEditor.getSession().on('change', function(){originalTextArea.value = aceEditor.getValue()})");

				GM_registerMenuCommand('GCPedia Ace Editor Settings', function() {
					Config.setup(editor);
				});
			});
		}
	});
})();
