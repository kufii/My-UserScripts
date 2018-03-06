// ==UserScript==
// @name         GitHub Editor - Change Default Settings
// @namespace    https://greasyfork.org/users/649
// @version      1.1.1
// @description  change default settings for the github editor
// @author       Adrien Pyke
// @match        *://github.com/*/new/*
// @match        *://github.com/*/edit/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
	'use strict';

	const loadConfig = function() {
		let defaults = {
			indentMode: 'tab',
			indentWidth: 4,
			wrapMode: 'off'
		};

		let cfg = GM_getValue('cfg');
		if (!cfg) return defaults;

		return JSON.parse(cfg);
	};

	const saveConfig = function(cfg) {
		GM_setValue('cfg', JSON.stringify(cfg));
	};

	const setup = function() {
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
				option.setAttribute('value', opt.value);
				option.textContent = opt.text;
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

		const createLineBreak = function() {
			return document.createElement('br');
		};

		const init = function(cfg) {
			let div = createContainer();

			let indentMode = createSelect('Indent mode', [
				{ value: 'space', text: 'Spaces' },
				{ value: 'tab', text: 'Tabs' }
			], cfg.indentMode);
			div.appendChild(indentMode);

			let indentWidth = createSelect('Indent size', [
				{ value: 2, text: 2 },
				{ value: 4, text: 4 },
				{ value: 8, text: 8 }
			], cfg.indentWidth);
			div.appendChild(indentWidth);

			let wrapMode = createSelect('Line wrap mode', [
				{ value: 'off', text: 'No wrap' },
				{ value: 'on', text: 'Soft wrap' }
			], cfg.wrapMode);
			div.appendChild(wrapMode);

			div.appendChild(createLineBreak());

			div.appendChild(createButton('Save', () => {
				let settings = {
					indentMode: indentMode.value,
					indentWidth: indentWidth.value,
					wrapMode: wrapMode.value
				};
				saveConfig(settings);
				div.remove();
			}));

			div.appendChild(createButton('Cancel', () => div.remove()));

			document.body.appendChild(div);
		};
		init(loadConfig());
	};

	const updateDropdown = function(dropdown, value) {
		dropdown.value = value;
		let evt = document.createEvent('HTMLEvents');
		evt.initEvent('change', false, true);
		dropdown.dispatchEvent(evt);
	};

	const applySettings = function(cfg) {
		let indentMode = document.querySelector('.js-code-indent-mode');
		let indentWidth = document.querySelector('.js-code-indent-width');
		let wrapMode = document.querySelector('.js-code-wrap-mode');

		if (location.href.match(/^https?:\/\/github.com\/[^/]*\/[^/]*\/new\/.*/)) {
			// new file
			updateDropdown(indentMode, cfg.indentMode);
			updateDropdown(indentWidth, cfg.indentWidth);
			updateDropdown(wrapMode, cfg.wrapMode);
		} else if (location.href.match(/^https?:\/\/github.com\/[^/]*\/[^/]*\/edit\/.*/)) {
			// edit file
			// if the file is using space indentation we don't want to change it
			if (indentMode.value === 'tab') {
				updateDropdown(indentWidth, cfg.indentWidth);
			}
			updateDropdown(wrapMode, cfg.wrapMode);
		}
	};

	GM_registerMenuCommand('GitHub Editor Settings', setup);
	let settings = loadConfig();

	waitForElems({
		sel: '.CodeMirror-code',
		onmatch() {
			applySettings(settings);
		}
	});
})();
