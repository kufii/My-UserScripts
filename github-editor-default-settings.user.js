// ==UserScript==
// @name         GitHub Editor - Change Default Settings
// @namespace    https://greasyfork.org/users/649
// @version      1.0.4
// @description  change default settings for the github editor
// @author       Adrien Pyke
// @match        *://github.com/*/new/*
// @match        *://github.com/*/edit/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
	'use strict';

	var loadConfig = function() {
		var defaults = {
			indentMode: 'tab',
			indentWidth: 4,
			wrapMode: 'off'
		};

		var cfg = GM_getValue('cfg');
		if (!cfg) return defaults;

		return JSON.parse(cfg);
	};

	var saveConfig = function (cfg) {
		GM_setValue('cfg', JSON.stringify(cfg));
	};

	var setup = function() {
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
				option.setAttribute('value', opt.value);
				option.textContent = opt.text;
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

		var init = function(cfg) {
			var div = document.createElement('div');
			div.style.backgroundColor = 'white';
			div.style.border = '1px solid black';
			div.style.position = 'absolute';
			div.style.top = '0';
			div.style.right = '0';

			var indentMode = createSelect('Indent mode', [
				{ value: 'space', text: 'Spaces' },
				{ value: 'tab', text: 'Tabs' }
			], cfg.indentMode);
			div.appendChild(indentMode);

			var indentWidth = createSelect('Indent size', [
				{ value: 2, text: 2 },
				{ value: 4, text: 4 },
				{ value: 8, text: 8 }
			], cfg.indentWidth);
			div.appendChild(indentWidth);

			var wrapMode = createSelect('Line wrap mode', [
				{ value: 'off', text: 'No wrap' },
				{ value: 'on', text: 'Soft wrap' }
			], cfg.wrapMode);
			div.appendChild(wrapMode);

			div.appendChild(document.createElement('br'));

			div.appendChild(createButton('Save', function(e) {
				var settings = {
					indentMode: indentMode.value,
					indentWidth: indentWidth.value,
					wrapMode: wrapMode.value
				};
				saveConfig(settings);
				div.remove();
			}));

			div.appendChild(createButton('Cancel', function(e) {
				div.remove();
			}));

			document.body.appendChild(div);
		};
		init(loadConfig());
	};

	var updateDropdown = function(dropdown, value) {
		dropdown.value = value;
		var evt = document.createEvent('HTMLEvents');
		evt.initEvent('change', false, true);
		dropdown.dispatchEvent(evt);
	};

	var applySettings = function(cfg) {
		var indentMode = document.querySelector('.js-code-indent-mode');
		var indentWidth = document.querySelector('.js-code-indent-width');
		var wrapMode = document.querySelector('.js-code-wrap-mode');

		if (location.href.match(/^https?:\/\/github.com\/[^\/]*\/[^\/]*\/new\/.*/)) {
			// new file
			updateDropdown(indentMode, cfg.indentMode);
			updateDropdown(indentWidth, cfg.indentWidth);
			updateDropdown(wrapMode, cfg.wrapMode);
		} else if (location.href.match(/^https?:\/\/github.com\/[^\/]*\/[^\/]*\/edit\/.*/)) {
			// edit file
			// if the file is using space indentation we don't want to change it
			if (indentMode.value === 'tab') {
				updateDropdown(indentWidth, cfg.indentWidth);
			}
			updateDropdown(wrapMode, cfg.wrapMode);
		}
	};

	GM_registerMenuCommand('GitHub Editor Settings', setup);
	var settings = loadConfig();
	applySettings(settings);
})();
