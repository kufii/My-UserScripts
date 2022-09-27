// ==UserScript==
// @name         Truffle TV Channel Points Claimer
// @namespace    https://greasyfork.org/users/649
// @version      2.0
// @description  Auto claim point on ludwig streams
// @author       Adrien Pyke
// @match        *://new.ludwig.social/channel-points
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  setInterval(() => {
    const root = document.getElementById('root').firstChild.shadowRoot.firstChild.shadowRoot;
    const node = root.querySelector('.claim');
    if (node) node.click();
  }, 1000);
})();
