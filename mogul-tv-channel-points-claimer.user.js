// ==UserScript==
// @name         Mogul TV Channel Points Claimer
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Auto claim point on ludwig streams
// @author       Adrien Pyke
// @match        *://ludwig.social/*
// @grant        none
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
  'use strict';

  waitForElems({
    sel: '.z-channel-points .claim.is-visible',
    config: { attributes: true, childList: true, subtree: true },
    onmatch: node => node.click()
  });
})();
