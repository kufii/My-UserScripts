// ==UserScript==
// @name         userstyles.org - auto select keep me logged in
// @namespace    https://greasyfork.org/users/649
// @version      1.1
// @description  Auto checks keep me logged in on userstyles.org
// @author       Adrien Pyke
// @match        *://userstyles.org/d/login*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  document.querySelector('#remember-openid').checked = true;
  document.querySelector('#remember-normal').checked = true;
})();
