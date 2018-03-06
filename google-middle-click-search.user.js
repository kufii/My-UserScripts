// ==UserScript==
// @name         Google - Middle Click Search
// @namespace    https://greasyfork.org/users/649
// @version      1.1
// @description  Opens search results in new tab when you middle click
// @author       Adrien Pyke
// @include      /^https?:\/\/www\.google\.[a-zA-Z]+\/?(?:\?.*)?$/
// @include      /^https?:\/\/www\.google\.[a-zA-Z]+\/search\/?\?.*$/
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_openInTab
// ==/UserScript==

(function() {
	'use strict';

	const setQueryParameter = function(key, value, url) {
		if (!url) url = window.location.href;
		let re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi'),
			hash;

		if (re.test(url)) {
			if (typeof value !== 'undefined' && value !== null) return url.replace(re, '$1' + key + '=' + value + '$2$3');
			else {
				hash = url.split('#');
				url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
				if (typeof hash[1] !== 'undefined' && hash[1] !== null) url += '#' + hash[1];
				return url;
			}
		} else if (typeof value !== 'undefined' && value !== null) {
			let separator = url.indexOf('?') !== -1 ? '&' : '?';
			hash = url.split('#');
			url = hash[0] + separator + key + '=' + value;
			if (typeof hash[1] !== 'undefined' && hash[1] !== null) url += '#' + hash[1];
			return url;
		} else return url;
	};

	const getUrl = function(value) {
		if (window.location.href.match(/^https?:\/\/www\.google\.[a-zA-Z]+\/search\/?\?.*$/)) {
			return setQueryParameter('q', encodeURIComponent(value));
		} else {
			return location.protocol + '//' + location.host + '/search?q=' + encodeURIComponent(value);
		}
	};

	waitForElems({
		sel: '#_fZl',
		onmatch(btn) {
			let input = document.querySelector('#lst-ib');

			btn.onmousedown = e => {
				if (e.button === 1) {
					e.preventDefault();
				}
			};

			btn.onclick = e => {
				if (e.button === 1 && input.value.trim()) {
					e.preventDefault();
					e.stopImmediatePropagation();
					let url = getUrl(input.value);
					GM_openInTab(url, true);
					return false;
				}
			};

			btn.onauxclick = btn.onclick;
		}
	});

	waitForElems({
		sel: '.sbsb_b li .sbqs_c, .sbsb_b li .sbpqs_d',
		onmatch(elem) {
			elem.onclick = e => {
				if (e.button === 1) {
					e.preventDefault();
					e.stopImmediatePropagation();
					let text = elem.classList.contains('sbpqs_d') ? elem.querySelector('span').textContent : elem.textContent;
					let url = getUrl(text);
					GM_openInTab(url, true);
					return false;
				}
			};
			elem.onauxclick = elem.onclick;
		}
	});
}());
