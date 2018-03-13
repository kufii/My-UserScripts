// ==UserScript==
// @name         GitHub Editor - Change Default Settings
// @namespace    https://greasyfork.org/users/649
// @version      1.1.2
// @description  change default settings for the github editor
// @author       Adrien Pyke
// @match        *://github.com/*/new/*
// @match        *://github.com/*/edit/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/44e3f88422a23c7eef2f7bf46f609eaf7c4019c2/libs/gm_config.js
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
	'use strict';

	const Config = GM_config([
		{
			key: 'indentMode',
			label: 'Indent mode',
			default: 'tab',
			type: 'dropdown',
			values: [
				{ value: 'space', text: 'Spaces' },
				{ value: 'tab', text: 'Tabs' }
			]
		}, {
			key: 'indentWidth',
			label: 'Indent size',
			default: 4,
			type: 'dropdown',
			values: [2, 4, 8]
		}, {
			key: 'wrapMode',
			label: 'Line wrap mode',
			default: 'off',
			type: 'dropdown',
			values: [
				{ value: 'off', text: 'No wrap' },
				{ value: 'on', text: 'Soft wrap' }
			]
		}
	]);

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

	GM_registerMenuCommand('GitHub Editor Settings', Config.setup);
	let settings = Config.load();

	waitForElems({
		sel: '.CodeMirror-code',
		onmatch() {
			applySettings(settings);
		}
	});
})();
