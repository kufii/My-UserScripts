// ==UserScript==
// @name         Prevent Wikia Ads
// @namespace    https://greasyfork.org/users/649
// @version      1.0.8
// @description  Prevent the ads that pop up when clicking a link to an external page on Wikias
// @author       Adrien Pyke
// @match        *://*.wikia.com/*
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @grant        GM_openInTab
// ==/UserScript==

(() => {
  'use strict';

  waitForElems({
    sel: 'a.exitstitial',
    onmatch(link) {
      link.onclick = e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.button === 0) {
          location.href = link.href;
        } else if (e.button === 1) {
          GM_openInTab(link.href, true);
        }
        return false;
      };
      link.onauxclick = link.onclick;
    }
  });
})();
