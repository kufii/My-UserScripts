// ==UserScript==
// @name         Youtube Middle Click Search
// @namespace    https://greasyfork.org/users/649
// @version      2.0.1
// @description  Middle clicking the search on youtube opens the results in a new tab
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_openInTab
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'YMCS';

	var Util = {
		log: function() {
			var args = [].slice.call(arguments);
			args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');
			console.log.apply(console, args);
		},
		q: function(query, context) {
			return (context || document).querySelector(query);
		},
		qq: function(query, context) {
			return [].slice.call((context || document).querySelectorAll(query));
		},
		getQueryParameter: function(name, url) {
			if (!url) url = window.location.href;
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		},
		encodeURIWithPlus: function(string) {
			return encodeURIComponent(string).replace(/%20/g, '+');
		}
	};

	waitForElems({
		sel: '#search-icon-legacy',
		stop: true,
		onmatch: function(btn) {
			btn.onmousedown = function(e) {
				if (e.button === 1) {
					e.preventDefault();
				}
			};
			btn.onclick = function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();

				var input = Util.q("input#search").value.trim();
				if (!input) return false;

				var url = location.origin + '/results?search_query=' + Util.encodeURIWithPlus(input);
				if (e.button === 1) {
					GM_openInTab(url, true);
				} else if(e.button === 0) {
					window.location.href = url;
				}

				return false;
			};
			btn.onauxclick = btn.onclick;
		}
	});

	waitForElems({
		sel: '.sbsb_c',
		onmatch: function(result) {
			result.onclick = function(e) {
				if (!e.target.classList.contains('sbsb_i')) {
					var search = Util.q('.sbpqs_a, .sbqs_c', result).textContent;

					var url = location.origin + '/results?search_query=' + Util.encodeURIWithPlus(search);
					if (e.button === 1) {
						GM_openInTab(url, true);
					} else if(e.button === 0) {
						window.location.href = url;
					}
				} else {
					if (e.button === 1) {
						// prevent opening in new tab if they middle click the remove button
						e.preventDefault();
						e.stopImmediatePropagation();
					}
				}
			};
			result.onauxclick = result.onclick;
		}
	});
})();
