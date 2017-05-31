// ==UserScript==
// @name         Youtube Middle Click Search
// @namespace    https://greasyfork.org/users/649
// @version      2.0
// @description  Middle clicking the search on youtube opens the results in a new tab
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
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

				var url = location.origin + '/results?search_query=' + encodeURIComponent(input);
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
		sel: '.sbpqs_a, .sbqs_c',
		onmatch: function(result) {
			result.onclick = function(e) {
				var search = result.textContent;
				var url = location.origin + '/results?search_query=' + encodeURIComponent(search);
				if (e.button === 1) {
					GM_openInTab(url, true);
				} else if(e.button === 0) {
					window.location.href = url;
				}
			};
			result.onauxclick = result.onclick;
		}
	});
})();
