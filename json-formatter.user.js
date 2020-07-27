// ==UserScript==
// @name         JSON Formatter
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  auto format JSON files
// @author       Adrien Pyke
// @include      /^.*\.json(\?.*)?$/
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.jsdelivr.net/gh/kufii/My-UserScripts@c7f613292672252995cb02a0cab3b6acb18ccac5/libs/gm_config.js
// ==/UserScript==

(() => {
  'use strict';

  const Config = GM_config([
    { key: 'tabSize', label: 'Tab Size', type: 'number', min: 0, default: 2 }
  ]);
  GM_registerMenuCommand('JSON Formatter: Tab Size', Config.setup);

  const format = tabSize => {
    const pre = document.querySelector('pre');
    pre.textContent = JSON.stringify(JSON.parse(pre.textContent), null, tabSize);
  };
  format(Config.load().tabSize);
  Config.onsave = ({ tabSize }) => format(tabSize);
})();
