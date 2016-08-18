// ==UserScript==
// @name         userstyles.org - auto select keep me logged in
// @namespace    https://greasyfork.org/users/649
// @version      1.0.1
// @description  Auto checks keep me logged in on userstyles.org
// @author       Adrien Pyke
// @match        *://userstyles.org/login*
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	document.querySelector('#remember-openid').checked = true;
	document.querySelector('#remember-normal').checked = true;
})();
