// ==UserScript==
// @name         Google - Middle Click Search
// @namespace    https://greasyfork.org/users/649
// @version      1.0.4
// @description  Opens search results in new tab when you middle click
// @author       Adrien Pyke
// @include      /^https?:\/\/www\.google\.[a-zA-Z]+\/?$/
// @include      /^https?:\/\/www\.google\.[a-zA-Z]+\/search\/?\?.*$/
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        GM_openInTab
// ==/UserScript==

(function() {
	'use strict';

	var updateQueryString = function(key, value, url) {
		if (!url) url = window.location.href;
		var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
			hash;

		if (re.test(url)) {
			if (typeof value !== 'undefined' && value !== null)
				return url.replace(re, '$1' + key + "=" + value + '$2$3');
			else {
				hash = url.split('#');
				url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
				if (typeof hash[1] !== 'undefined' && hash[1] !== null)
					url += '#' + hash[1];
				return url;
			}
		}
		else {
			if (typeof value !== 'undefined' && value !== null) {
				var separator = url.indexOf('?') !== -1 ? '&' : '?';
				hash = url.split('#');
				url = hash[0] + separator + key + '=' + value;
				if (typeof hash[1] !== 'undefined' && hash[1] !== null)
					url += '#' + hash[1];
				return url;
			}
			else
				return url;
		}
	};

	var getUrl = function(value) {
		if (window.location.href.match(/^https?:\/\/www\.google\.[a-zA-Z]+\/search\/?\?.*$/)) {
			return updateQueryString('q', encodeURIComponent(value));
		} else {
			return location.protocol + '//' + location.host + '/search?q=' + encodeURIComponent(value);
		}
	};

	waitForElems('#sblsbb > button', function(btn) {
		var input = document.querySelector('#lst-ib');

		btn.onmousedown = function(e) {
			if (e.button === 1) {
				e.preventDefault();
			}
		};

		btn.onclick = function(e) {
			if (e.button === 1 && input.value.trim()) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var url = getUrl(input.value);
				GM_openInTab(url, true);
				return false;
			}
		};
	});
	waitForElems('.sbsb_b li .sbqs_c, .sbsb_b li .sbpqs_d', function(elem) {
		elem.onclick = function(e) {
			if (e.button === 1) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var text = elem.classList.contains('sbpqs_d') ? elem.querySelector('span').textContent : elem.textContent;
				var url = getUrl(text);
				GM_openInTab(url, true);
				return false;
			}
		};
	});
})();
