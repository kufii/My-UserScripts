// ==UserScript==
// @name         RetailMeNot Auto Show Coupons
// @namespace    https://greasyfork.org/users/649
// @version      1.0.1
// @description  Auto shows coupons and stops pop-unders on RetailMeNot
// @author       Adrien Pyke
// @match        *://www.retailmenot.com/*
// @match        *://www.retailmenot.ca/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'RetailMeNot Auto Show Coupons';

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
		setQueryParameter: function(key, value, url) {
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
		},
		removeQueryParameter: function(key, url) {
			return Util.setQueryParameter(key, null, url);
		},
		changeUrl: function(url) {
			window.history.replaceState({ path: url }, '', url);
		}
	};

	var App = {
		CACHE: {},
		getOutUrl: function(url, cb) {
			var self = this;
			if (self.CACHE[url]) {
				cb(self.CACHE[url]);
			} else {
				GM_xmlhttpRequest({
					method: 'GET',
					url: url,
					onload: function(response) {
						self.CACHE[url] = response.finalUrl;
						cb(response.finalUrl);
					}
				});
			}
		}
	};

	// Show Coupons
	Util.qq('.crux > .cover').forEach(function(cover) {
		cover.remove();
	});

	// Disable Pop Unders
	Util.qq('.offer').forEach(function(offer) {
		var path = '/coupons/' + offer.dataset.storedomain;
		var href = window.location.protocol + "//" + window.location.host + path + '?c=' + offer.dataset.offerid;
		var clickHandler = function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			if (e.button === 1) {
				GM_openInTab(href, true);
			} else {
				if (window.location.pathname === path) {
					window.location.replace(href);
				} else {
					window.location = href;
				}
			}
			return false;
		};

		waitForElems('a.offer-title', function(title) {
			title.href = href;
			title.onclick = clickHandler;
		}, true);

		var button = Util.q('.action-button', offer);
		if (button) {
			button.onclick = clickHandler;
		}
	});

	var regex = /^https?:\/\/www.retailmenot.(?:com|ca)\/out\//;
	Util.qq('a').filter(function(link) {
		return link.href.match(regex);
	}).forEach(function(link) {
		link.href = '#';
		App.getOutUrl(link.href, function(href) {
			link.href = href;
		});
	});

	// remove coupon query param so reloads work properly
	Util.changeUrl(Util.removeQueryParameter('c'));
})();