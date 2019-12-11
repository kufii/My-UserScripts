// ==UserScript==
// @name         userstyles.org - Auto Enable Source Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.1.0
// @description  auto enables the source editor on userstyles.org
// @author       Adrien Pyke
// @match        *://userstyles.org/d/styles/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  document.querySelector('#enable-source-editor-code').click();
})();
