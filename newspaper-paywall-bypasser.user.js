// ==UserScript==
// @name         Newspaper Paywall Bypasser
// @namespace    https://greasyfork.org/users/649
// @version      1.4.3
// @description  Bypass the paywall on online newspapers
// @author       Adrien Pyke
// @match        *://www.thenation.com/article/*
// @match        *://www.wsj.com/articles/*
// @match        *://www.bostonglobe.com/*
// @match        *://www.nytimes.com/*
// @match        *://myaccount.nytimes.com/mobile/wall/smart/*
// @match        *://mobile.nytimes.com/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @noframes
// ==/UserScript==

(function() {
	'use strict';

	// short reference to unsafeWindow (or window if unsafeWindow is unavailable e.g. bookmarklet)
	var W = (typeof unsafeWindow === 'undefined') ? window : unsafeWindow;
	var SCRIPT_NAME = 'Newspaper Paywall Bypasser';

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
			if (!url) url = W.location.href;
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		},
		appendStyle: function(css) {
			var out = '';
			for (var selector in css) {
				out += selector + '{';
				for (var rule in css[selector]) {
					out += rule + ':' + css[selector][rule] + '!important;';
				}
				out += '}';
			}

			var style = document.createElement('style');
			style.type = 'text/css';
			style.appendChild(document.createTextNode(out));
			document.head.appendChild(style);
		},
		clearAllIntervals: function() {
			var interval_id = window.setInterval(null, 9999);
			for (var i = 1; i <= interval_id; i++) {
				window.clearInterval(i);
			}
		}
	};

	// GM_xmlhttpRequest polyfill
	if (typeof GM_xmlhttpRequest === 'undefined') {
		Util.log('Adding GM_xmlhttpRequest polyfill');
		W.GM_xmlhttpRequest = function(config) {
			var xhr = new XMLHttpRequest();
			if (config.headers) {
				for (var header in config.headers) {
					xhr.setRequestHeader(header, config.headers[header]);
				}
			}
			if (config.anonymous) {
				xhr.setRequestHeader('Authorization', '');
			}
			xhr.open(config.method || 'GET', config.url);
			if (config.onload) {
				xhr.onload = function() {
					config.onload(xhr);
				};
			}
			if (config.onerror) {
				xhr.onerror = function() {
					config.onerror(xhr.status);
				};
			}
			xhr.send();
		};
	}

	/**
	* Sample Implementation:
	{
		name: 'something', // name of the implementation
		match: '^https?://domain.com/.*', // the url to react to
		remove: '#element', // css selector to get elements to remove
		wait: 3000, // how many ms to wait before running (to wait for elements to load), or a css selector to keep trying until it returns an elem
		referer: 'something', // load content in with an xhr using this referrer
		replace: '#element', // css selector to get element to replace with xhr
		replaceUsing: 'url', // url to use for the replace xhr. If null, it'll use the curren url.
		replaceWith: '#element', // css selector to get element to replace the element with. if null, it will use the same seletor as replace.
		css: {}, // object, keyed by css selector of css rules
		bmmode: function() { }, // function to call before doing anything else if in BM_MODE
		fn: function() { } // a function to run before doing anything else for more complicated logic
	}
	* Any of the CSS selectors can be functions instead that return the desired value.
	*/

	var implementations = [{
		name: 'The Nation',
		match: '^https?://www.thenation.com/article/.*',
		remove: '#paywall',
		wait: '#paywall',
		bmmode: function() { Paywall.hide(); }
	}, {
		name: 'Wall Street Journal',
		match: '^https?://www.wsj.com/articles/.*',
		referer: 'http://www.google.com',
		replace: 'article > div:nth-of-type(1)'
	}, {
		name: 'Boston Globe',
		match: '^https?://www.bostonglobe.com/.*',
		css: {
			'html, body, #contain': {
				overflow: 'visible'
			},
			'.mfp-wrap, .mfp-ready': {
				display: 'none'
			}
		}
	}, {
		name: 'NY Times',
		match: '^https?://www.nytimes.com/.*',
		css: {
			'html, body': {
				overflow: 'visible'
			},
			'#gatewayCreative, #overlay': {
				display: 'none'
			}
		},
		cleanupStory: function(story) {
			if (story) {
				// prevent payywall from finding the elements to remove
				Util.qq('figure', story).forEach(function(figure) {
					figure.outerHTML = figure.outerHTML.replace(/<figure/, '<div').replace(/<\/figure/, '</div');
				});
				Util.qq('.story-content', story).forEach(function(paragraph) {
					paragraph.className = '';
				});
			}
			return story;
		},
		bmmode: function() {
			var self = this;
			Util.clearAllIntervals();
			GM_xmlhttpRequest({
				url: W.location.href,
				method: 'GET',
				onload: function(response) {
					var tempDiv = document.createElement('div');
					tempDiv.innerHTML = response.responseText;
					var story = self.cleanupStory(Util.q('#story', tempDiv));
					if (story) {
						Util.q('#story').innerHTML = story.innerHTML;
					}
				}
			});
		},
		fn: function() {
			// clear intervals once the paywall comes up to prevent changes afterward
			waitForElems('#gatewayCreative', Util.clearAllIntervals, true);
			this.cleanupStory(Util.q('#story'));
		}
	}, {
		name: 'NY Times Mobile Redirect',
		match: '^https?://myaccount.nytimes.com/mobile/wall/smart/.*',
		fn: function() {
			var article = Util.getQueryParameter('EXIT_URI');
			if (article) {
				W.location.replace('http://mobile.nytimes.com?LOAD_ARTICLE=' + encodeURIComponent(article));
			}
		}
	}, {
		name: 'NY Times Mobile Loader',
		match: '^https?://mobile.nytimes.com',
		css: {
			'.full-art': {
				'font-family': 'Georgia,serif',
				color: '#333'
			},
			'.full-art .article-body': {
				'margin-bottom': '26px',
				'font-size': '1.6em',
				'line-height': '1.4em'
			}
		},
		replaceUsing: Util.getQueryParameter('LOAD_ARTICLE'),
		replace: function() {
			if (this.repalceUsing) {
				return '.sect';
			}
			return null;
		},
		replaceWith: function() {
			if (this.repalceUsing) {
				return 'article';
			}
			return null;
		}
	}];
	// END OF IMPLEMENTATIONS

	var App = {
		currentImpName: null,

		bypass: function(imp) {
			if (W.BM_MODE && imp.bmmode) {
				Util.log('Running bookmarkelet specific function');
				imp.bmmode();
			}
			if (imp.fn) {
				Util.log('Running site specific function');
				imp.fn();
			}
			if (imp.css) {
				Util.log('Adding style');
				var cssObj = typeof imp.css === 'function' ? imp.css() : imp.css;
				Util.appendStyle(cssObj);
			}
			if (imp.remove) {
				Util.log('Removing elements');
				var elemsToRemove = typeof imp.remove === 'function' ? imp.remove() : Util.qq(imp.remove);
				elemsToRemove.forEach(function(elem) {
					elem.remove();
				});
			}

			var replaceSelector = typeof imp.replace === 'function' ? imp.replace() : imp.replace;
			var replaceUsing = typeof imp.replaceUsing === 'function' ? imp.replaceUsing() : imp.replaceUsing;
			var theReferer = typeof imp.referer === 'function' ? imp.referer() : imp.referer;
			if (replaceSelector || replaceUsing || theReferer) {
				replaceUsing = replaceUsing || W.location.href;

				Util.log('Loading xhr for "' + replaceUsing + '" with referer: ' + theReferer);
				GM_xmlhttpRequest ({
					method: 'GET',
					url: replaceUsing,
					headers: {
						referer: theReferer
					},
					anonymous: true,
					onload: function(response) {
						if (replaceSelector) {
							var replaceWithSelector = typeof imp.replaceWith === 'function' ? imp.replaceWith() : imp.replaceWith;
							replaceWithSelector = replaceWithSelector || replaceSelector;

							var tempDiv = document.createElement('div');
							tempDiv.innerHTML = response.responseText;

							Util.q(replaceSelector).innerHTML = Util.q(replaceWithSelector, tempDiv).innerHTML;
						} else {
							document.body.innerHTML = response.responseText;
						}
					},
					onerror: function(error) {
						Util.log('error occured when loading xhr');
					}
				});
			}
			Util.log('Paywall Bypassed.');
		},

		waitAndBypass: function(imp) {
			if (imp.wait) {
				var waitType = typeof imp.wait;
				if(waitType === 'number') {
					setTimeout(App.bypass(imp), imp.wait || 0);
				} else {
					var wait = waitType === 'function' ? imp.wait() : imp.wait;
					waitForElems(wait, function() {
						Util.log('Condition fulfilled, bypassing');
						App.bypass(imp);
					}, true);
				}
			} else {
				App.bypass(imp);
			}
		},

		start: function(imps) {
			Util.log('starting...');
			var success = imps.some(function(imp) {
				if (imp.match && (new RegExp(imp.match, 'i')).test(W.location.href)) {
					App.currentImpName = imp.name;
					App.waitAndBypass(imp);
					return true;
				}
			});

			if (!success) {
				Util.log('no implementation for ' + W.location.href, 'error');
			}
		}
	};

	App.start(implementations);
})();
