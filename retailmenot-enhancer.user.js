// ==UserScript==
// @name         RetailMeNot Enhancer
// @namespace    https://greasyfork.org/users/649
// @version      3.0
// @description  Auto shows coupons and stops pop-unders on RetailMeNot
// @author       Adrien Pyke
// @match        *://www.retailmenot.com/*
// @match        *://www.retailmenot.ca/*
// @match        *://www.retailmenot.de/*
// @match        *://www.retailmenot.es/*
// @match        *://www.retailmenot.it/*
// @match        *://www.retailmenot.pl/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// @grant        GM_openInTab
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
		getQueryParameter: function(name, url) {
			if (!url) url = window.location.href;
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
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
		},
		createCookie: function(name, value, days) {
			var expires;
			if (days) {
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				expires = "; expires="+date.toGMTString();
			}
			else expires = "";
			document.cookie = name+"="+value+expires+"; path=/";
		}
	};

	// remove force reload param
	Util.changeUrl(Util.removeQueryParameter('r'));
	if (window.location.href.match(/^https?:\/\/www\.retailmenot\.com/i)) { // US
		Util.log('Enhancing US site');
		// Show Coupons
		document.body.classList.add('ctc');

		// Disable pop unders
		waitForElems({
			sel: '.js-outclick, .js-title > a, .js-triggers-outclick, .js-coupon-square, .offer-item-in-list',
			onmatch: function(button) {
				var path = button.dataset.newTab && !button.dataset.newTab.match(/^\/out/i) ? button.dataset.newTab : button.dataset.mainTab;
				var href = window.location.protocol + "//" + window.location.host + path;
				if (path) {
					var handler = function(e) {
						e.preventDefault();
						e.stopImmediatePropagation();
						if (e.button === 1) {
							GM_openInTab(href, true);
						} else {
							if (window.location.pathname === path) {
								window.location.replace(href);
							} else {
								window.location.href = href;
							}
						}
						return false;
					};
					if (button.classList.contains('offer-item-in-list')) {
						var offerButton = Util.q('.offer-button', button);
						if (offerButton) {
							offerButton.onclick = handler;
						}
						var offerTitle = Util.q('.offer-title', button);
						if (offerTitle) {
							offerTitle.href = href;
							offerTitle.onclick = handler;
						}
					} else {
						if (button.tagname === 'A') {
							button.href = href;
						}
						button.onclick = handler;
						Util.qq('*', button).forEach(function(elem) {
							elem.onclick = handler;
						});
					}
				}
			}
		});
	} else if (window.location.href.match(/^https?:\/\/www\.retailmenot\.ca/i)) { // CANADA
		Util.log('Enhancing Canadian site');
		// Show Coupons
		Util.qq('.crux > .cover').forEach(function(cover) {
			cover.remove();
		});

		// Disable Pop Unders
		waitForElems({
			sel: '.offer, .stage .coupon',
			onmatch: function(offer) {
				var clickHandler = function(e) {
					e.preventDefault();
					e.stopImmediatePropagation();
					var href = window.location.protocol + "//" + window.location.host + window.location.pathname + '?c=' + offer.dataset.offerid;
					if (e.button === 1) {
						GM_openInTab(href, true);
					} else {
						window.location.replace(href);
					}
					return false;
				};

				if (!offer.parentNode.classList.contains('stage')) {
					waitForElems({
						context: offer,
						sel: 'a.offer-title',
						stop: true,
						onmatch: function(title) {
							title.href = href;
							title.onclick = clickHandler;
						}
					});
				}

				Util.qq('.action-button, .crux, .caterpillar-title, .caterpillar-code', offer).forEach(function(elem){
					elem.onclick = clickHandler;
				});
			}
		});

		// disable pop unders on the exclusive tags
		Util.qq('.exclusive_icon').forEach(function(tag) {
			tag.onclick = function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
			};
		});
	} else { // GERMANY, SPAIN, ITALY, POLAND
		Util.log('Enhancing international site');
		// Remove hash after modal comes up
		if (window.location.href.indexOf('#') !== -1) {
			waitForElems({
				sel: '#modal-coupon',
				stop: true,
				onmatch: function() {
					Util.changeUrl(window.location.href.split('#')[0]);
				}
			});
		}
		// disable pop unders
		waitForElems({
			sel: '.coupon',
			onmatch: function(coupon) {
				var clickHandler = function(e) {
					e.preventDefault();
					e.stopImmediatePropagation();
					Util.createCookie('click_' + coupon.dataset.suffix, true);
					if (e.button === 1) {
						GM_openInTab(window.location.protocol + "//" + window.location.host + window.location.pathname + '#' + coupon.dataset.suffix, true);
					} else {
						window.location.replace(window.location.protocol + "//" + window.location.host + window.location.pathname + '?r=1#' + coupon.dataset.suffix);
					}
					return false;
				};
				Util.qq('.outclickable', coupon).forEach(function(elem) {
					elem.onclick = clickHandler;
				});
			}
		});
	}
	// human checks
	var regex = /^https?:\/\/www\.retailmenot\.[^\/]+\/humanCheck\.php/i;
	Util.qq('a').filter(function(link) {
		return link.href.match(regex);
	}).forEach(function(link) {
		var url = Util.getQueryParameter('url', link.href);
		if (url) {
			link.href = window.location.protocol + "//" + window.location.host + url;
		}
	});

	// remove coupon query param so reloads work properly
	Util.changeUrl(Util.removeQueryParameter('c'));
})();
