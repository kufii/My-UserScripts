// ==UserScript==
// @name         GCPedia Ace Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.2.11
// @description  Use the Ace Editor when editing things on GCPedia
// @author       Adrien Pyke
// @match        http://www.gcpedia.gc.ca/*
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/da58bbdba70e181586255f08cd8d63da4d2c4953/libs/gm_config.js
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
			GM_addStyle(out);
		},
		appendAfter(elem, elemToAppend) {
			elem.parentNode.insertBefore(elemToAppend, elem.nextElementSibling);
		}
	};

	const Config = GM_config([
		{
			key: 'theme',
			label: 'Theme',
			default: 'monokai',
			type: 'dropdown',
			values: [
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
				'idle_fingers',
				'iplastic',
				'katzenmilch',
				'kr_theme',
				'kuroir',
				'merbivore',
				'merbivore_soft',
				'mono_industrial',
				'monokai',
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
			]
		}
	]);

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
				Config.onchange = (key, value) => editor.setTheme(`ace/theme/${value}`);
				Config.oncancel = cfg => editor.setTheme(`ace/theme/${cfg.theme}`);
			});
		}
	});
})();
