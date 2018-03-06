// ==UserScript==
// @name         GCPedia Ace Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.2.1
// @description  Use the Ace Editor when editing things on GCPedia
// @author       Adrien Pyke
// @match        http://www.gcpedia.gc.ca/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
	'use strict';

	const SCRIPT_NAME = 'GCPedia Ace Editor';

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
		addScript(src, onload) {
			let s = document.createElement('script');
			s.onload = onload;
			s.src = src;
			document.body.appendChild(s);
		},
		addScriptText(code, onload) {
			let s = document.createElement('script');
			s.onload = onload;
			s.textContent = code;
			document.body.appendChild(s);
		},
		appendStyle(css) {
			let out = '';
			for (let selector in css) {
				out += `${selector}{`;
				for (let rule in css[selector]) {
					out += `${rule}:${css[selector][rule]}!important;`;
				}
				out += '}';
			}

			let style = document.createElement('style');
			style.type = 'text/css';
			style.appendChild(document.createTextNode(out));
			document.head.appendChild(style);
		},
		appendAfter(elem, elemToAppend) {
			elem.parentNode.insertBefore(elemToAppend, elem.nextElementSibling);
		}
	};

	const Config = {
		load() {
			let defaults = {
				theme: 'monokai'
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

		setup(editor) {
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

			const createSelect = function(label, options, value) {
				let select = document.createElement('select');
				select.style.margin = '2px';
				let optgroup = document.createElement('optgroup');
				if (label) {
					optgroup.setAttribute('label', label);
				}
				select.appendChild(optgroup);
				options.forEach(opt => {
					let option = document.createElement('option');
					option.setAttribute('value', opt);
					option.textContent = opt;
					optgroup.appendChild(option);
				});
				select.value = value;
				return select;
			};

			const createButton = function(text, onclick) {
				let button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};

			const createLabel = function(label) {
				let lbl = document.createElement('span');
				lbl.textContent = label;
				return lbl;
			};

			const createLineBreak = function() {
				return document.createElement('br');
			};

			const init = function(cfg) {
				let div = createContainer();

				let theme = createSelect('Theme', [
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

				theme.onchange = () => {
					editor.setTheme(`ace/theme/${theme.value}`);
				};

				div.appendChild(createButton('Save', () => {
					let settings = {
						theme: theme.value
					};
					Config.save(settings);
					div.remove();
				}));

				div.appendChild(createButton('Cancel', () => {
					editor.setTheme(`ace/theme/${cfg.theme}`);
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
		onmatch(textArea) {
			let wrapper = document.createElement('div');
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
			Util.addScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ace.js', () => {
				let editor = unsafeWindow.ace.edit('ace');
				editor.setTheme(`ace/theme/${Config.load().theme}`);
				editor.getSession().setMode('ace/mode/html');
				editor.resize();

				unsafeWindow.aceEditor = editor;
				unsafeWindow.originalTextArea = textArea;

				Util.addScriptText('aceEditor.getSession().on(\'change\', function(){originalTextArea.value = aceEditor.getValue()})');

				GM_registerMenuCommand('GCPedia Ace Editor Settings', () => {
					Config.setup(editor);
				});
			});
		}
	});
})();
