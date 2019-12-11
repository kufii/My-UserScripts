// ==UserScript==
// @name         GitHub Editor - Change Default Settings
// @namespace    https://greasyfork.org/users/649
// @version      1.1.20
// @description  change default settings for the github editor
// @author       Adrien Pyke
// @match        *://github.com/*/new/*
// @match        *://github.com/*/edit/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://gitcdn.link/repo/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
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
    },
    {
      key: 'indentWidth',
      label: 'Indent size',
      default: 4,
      type: 'dropdown',
      values: [2, 4, 8]
    },
    {
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
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('change', false, true);
    dropdown.dispatchEvent(evt);
  };

  const applySettings = function(cfg) {
    const indentMode = document.querySelector('.js-code-indent-mode');
    const indentWidth = document.querySelector('.js-code-indent-width');
    const wrapMode = document.querySelector('.js-code-wrap-mode');

    if (location.href.match(/^https?:\/\/github.com\/[^/]*\/[^/]*\/new\/.*/u)) {
      // new file
      updateDropdown(indentMode, cfg.indentMode);
      updateDropdown(indentWidth, cfg.indentWidth);
      updateDropdown(wrapMode, cfg.wrapMode);
    } else if (location.href.match(/^https?:\/\/github.com\/[^/]*\/[^/]*\/edit\/.*/u)) {
      // edit file
      // if the file is using space indentation we don't want to change it
      if (indentMode.value === 'tab') {
        updateDropdown(indentWidth, cfg.indentWidth);
      }
      updateDropdown(wrapMode, cfg.wrapMode);
    }
  };

  GM_registerMenuCommand('GitHub Editor Settings', Config.setup);
  const settings = Config.load();

  waitForElems({
    sel: '.CodeMirror-code',
    onmatch() {
      applySettings(settings);
    }
  });
})();
