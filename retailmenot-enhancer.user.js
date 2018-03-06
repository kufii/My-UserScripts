// ==UserScript==
// @name         RetailMeNot Enhancer
// @namespace    https://greasyfork.org/users/649
// @version      3.1.1
// @description  Auto shows coupons and stops pop-unders on RetailMeNot
// @author       Adrien Pyke
// @match        *://www.retailmenot.com/*
// @match        *://www.retailmenot.ca/*
// @match        *://www.retailmenot.de/*
// @match        *://www.retailmenot.es/*
// @match        *://www.retailmenot.it/*
// @match        *://www.retailmenot.pl/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_openInTab
// ==/UserScript==

(() => {
	'use strict';

	const SCRIPT_NAME = 'RetailMeNot Auto Show Coupons';

	const Util = {
		log(...args) {
			args.unshift(`%c${SCRIPT_NAME}:`, 'font-weight: bold;color: #233c7b;');
			console.log(...args);
		},
		q(query, context = document) {
			return context.querySelector(query);
		},
		qq(query, context = document) {
			return Array.from(context.querySelectorAll(query));
		},
		getQueryParameter(name, url = window.location.href) {
			name = name.replace(/[[\]]/g, '\\$&');
			let regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		},
		setQueryParameter(key, value, url = window.location.href) {
			if (!url) url = window.location.href;
			let re = new RegExp(`([?&])${key}=.*?(&|#|$)(.*)`, 'gi'),
				hash;

			if (re.test(url)) {
				if (typeof value !== 'undefined' && value !== null) return url.replace(re, `$1${key}=${value}$2$3`);
				else {
					hash = url.split('#');
					url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
					if (typeof hash[1] !== 'undefined' && hash[1] !== null) url += `#${hash[1]}`;
					return url;
				}
			} else if (typeof value !== 'undefined' && value !== null) {
				let separator = url.indexOf('?') !== -1 ? '&' : '?';
				hash = url.split('#');
				url = `${hash[0] + separator + key}=${value}`;
				if (typeof hash[1] !== 'undefined' && hash[1] !== null) url += `#${hash[1]}`;
				return url;
			} else return url;
		},
		removeQueryParameter(key, url) {
			return Util.setQueryParameter(key, null, url);
		},
		changeUrl(url) {
			window.history.replaceState({ path: url }, '', url);
		},
		createCookie(name, value, days) {
			let expires;
			if (days) {
				let date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				expires = `; expires=${date.toGMTString()}`;
			} else expires = '';
			document.cookie = `${name}=${value}${expires}; path=/`;
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
			onmatch(button) {
				let path = button.dataset.newTab && !button.dataset.newTab.match(/^\/out/i) ? button.dataset.newTab : button.dataset.mainTab;
				let href = `${window.location.protocol}//${window.location.host}${path}`;
				if (path) {
					let handler = e => {
						e.preventDefault();
						e.stopImmediatePropagation();
						if (e.button === 1) {
							GM_openInTab(href, true);
						} else if (window.location.pathname === path) {
							window.location.replace(href);
						} else {
							window.location.href = href;
						}
						return false;
					};
					if (button.classList.contains('offer-item-in-list')) {
						let offerButton = Util.q('.offer-button', button);
						if (offerButton) {
							offerButton.onclick = handler;
						}
						let offerTitle = Util.q('.offer-title', button);
						if (offerTitle) {
							offerTitle.href = href;
							offerTitle.onclick = handler;
						}
					} else {
						if (button.tagname === 'A') {
							button.href = href;
						}
						button.onclick = handler;
						Util.qq('*', button).forEach(elem => {
							elem.onclick = handler;
						});
					}
				}
			}
		});
	} else if (window.location.href.match(/^https?:\/\/www\.retailmenot\.ca/i)) { // CANADA
		Util.log('Enhancing Canadian site');
		// Show Coupons
		Util.qq('.crux > .cover').forEach(cover => {
			cover.remove();
		});

		// Disable Pop Unders
		waitForElems({
			sel: '.offer, .stage .coupon',
			onmatch(offer) {
				let href = `${window.location.protocol}//${window.location.host}${window.location.pathname}?c=${offer.dataset.offerid}`;

				let clickHandler = e => {
					e.preventDefault();
					e.stopImmediatePropagation();
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
						onmatch(title) {
							title.href = href;
							title.onclick = clickHandler;
						}
					});
				}

				Util.qq('.action-button, .crux, .caterpillar-title, .caterpillar-code', offer).forEach(elem => {
					elem.onclick = clickHandler;
				});
			}
		});

		// disable pop unders on the exclusive tags
		Util.qq('.exclusive_icon').forEach(tag => {
			tag.onclick = e => {
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
				onmatch() {
					Util.changeUrl(window.location.href.split('#')[0]);
				}
			});
		}
		// disable pop unders
		waitForElems({
			sel: '.coupon',
			onmatch(coupon) {
				let id = coupon.dataset.suffix;
				let href = `${window.location.protocol}//${window.location.host}${window.location.pathname}?r=1#${id}`;
				let clickHandler = e => {
					e.preventDefault();
					e.stopImmediatePropagation();
					Util.createCookie(`click_${id}`, true);
					if (e.button === 1) {
						GM_openInTab(href, true);
					} else {
						window.location.replace(href);
					}
					return false;
				};
				Util.qq('.outclickable', coupon).forEach(elem => {
					if (elem.tagName === 'A') {
						elem.href = href;
					}
					elem.onclick = clickHandler;
				});
			}
		});
	}
	// human checks
	let regex = /^https?:\/\/www\.retailmenot\.[^/]+\/humanCheck\.php/i;
	Util.qq('a').filter(link => {
		return link.href.match(regex);
	}).forEach(link => {
		let url = Util.getQueryParameter('url', link.href);
		if (url) {
			link.href = `${window.location.protocol}//${window.location.host}${url}`;
		}
	});

	// remove coupon query param so reloads work properly
	Util.changeUrl(Util.removeQueryParameter('c'));
})();
