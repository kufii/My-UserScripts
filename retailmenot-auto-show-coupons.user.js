// ==UserScript==
// @name         RetailMeNot Auto Show Coupons
// @namespace    https://greasyfork.org/users/649
// @version      1.1
// @description  Auto shows coupons and stops pop-unders on RetailMeNot
// @author       Adrien Pyke
// @match        *://www.retailmenot.com/*
// @match        *://www.retailmenot.ca/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/*jshint scripturl:true*/

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
		var href = window.location.protocol + "//" + window.location.host + '' + window.location.pathname + '?c=' + offer.dataset.offerid;
		var clickHandler = function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			if (e.button === 1) {
				GM_openInTab(href, true);
			} else {
				window.location.replace(href);
			}
			return false;
		};

		var id = offer.id.charAt(0).match(/[0-9]/) ? '\\' + offer.id : offer.id;
		waitForElems('#' + id + ' a.offer-title', function(title) {
			title.href = href;
			title.onclick = clickHandler;
		}, true);

		var button = Util.q('.action-button', offer);
		if (button) {
			button.onclick = clickHandler;
		}
	});

	var regex = /^https?:\/\/www.retailmenot.(?:com|ca)\/out\//i;
	Util.qq('a').filter(function(link) {
		return link.href.match(regex) && !link.classList.contains('offer-title');
	}).forEach(function(link) {
		var url = link.href;
		link.href = 'javascript:void(0)';
		App.getOutUrl(url, function(href) {
			link.href = href;
		});
	});

	// disable pop unders on the exclusive tags
	Util.qq('.exclusive_icon').forEach(function(tag) {
		tag.onclick = function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
		};
	});

	// remove coupon query param so reloads work properly
	Util.changeUrl(Util.removeQueryParameter('c'));
})();