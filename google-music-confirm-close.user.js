// ==UserScript==
// @name         Google Music Confirm Close
// @namespace    https://greasyfork.org/users/649
// @version      1.0.9
// @description  Confirms close when playing music on google music
// @author       Adrien Pyke
// @match        *://play.google.com/music/listen*
// @grant        unsafeWindow
// @noframes
// ==/UserScript==

(function() {
	'use strict';

	unsafeWindow.onbeforeunload = function (e) {
		var button = document.querySelector('paper-icon-button[data-id="play-pause"]');
		if (button.classList.contains('playing'))
			return 'Are you sure you want to close Google Music?';
	};
})();
