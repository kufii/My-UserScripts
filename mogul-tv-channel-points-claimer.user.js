// ==UserScript==
// @name         Mogul TV Channel Points Claimer
// @namespace    https://greasyfork.org/users/649
// @version      1.1
// @description  Auto claim points on ludwig streams
// @author       Adrien Pyke
// @match        *://ludwig.social/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  setInterval(() => {
    const node = document.querySelector('.z-channel-points .claim.is-visible');
    if (node) node.click();
  }, 1000);
})();
