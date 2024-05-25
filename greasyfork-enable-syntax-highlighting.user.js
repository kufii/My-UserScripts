// ==UserScript==
// @name         Greasy Fork - Auto Enable Syntax-Highlighting Source Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.1.5
// @description  Auto enables greasy fork's syntax-highlighting source editor
// @author       Adrien Pyke
// @match        *://greasyfork.org/*/script_versions/new*
// @match        *://greasyfork.org/*/scripts/*/versions/new*
// @require      https://cdn.jsdelivr.net/gh/fuzetsu/userscripts@ec863aa92cea78a20431f92e80ac0e93262136df/wait-for-elements/wait-for-elements.js
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  waitForElems({
    sel: '#enable-source-editor-code',
    stop: true,
    onmatch(checkbox) {
      checkbox.click();
    }
  });
})();
