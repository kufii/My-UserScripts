// ==UserScript==
// @name         Newspaper Paywall Bypasser
// @namespace    https://greasyfork.org/users/649
// @version      1.2.5
// @description  Bypass the paywall on online newspapers
// @author       Adrien Pyke
// @match        *://www.thenation.com/*
// @match        *://www.wsj.com/*
// @match        *://www.bostonglobe.com/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @noframes
// ==/UserScript==

(function() {
	'use strict';
	
	// short reference to unsafeWindow (or window if unsafeWindow is unavailable e.g. bookmarklet)
	var W = (typeof unsafeWindow === 'undefined') ? window : unsafeWindow;
	var SCRIPT_NAME = 'Newspaper Paywall Bypasser';

	/**
	* Sample Implementation:
	{
		name: 'something', // name of the implementation 
		match: "^https?://domain.com/.*", // the url to react to
		remove: '#element', // css selector to get element to remove 
		wait: 3000, // how many ms to wait before running (to wait for elements to load), or a css selector to keep trying until it returns an elem
		referer: 'something', // load content in with an xhr using this referrer
		replace: '#element', // css selector to get element to replace with xhr
		css: {}, // object, keyed by css selector of css rules
		bmmode: function() { } // function to call before doing anything else if in BM_MODE
	}
	* Any of the CSS selectors can be functions instead that return the desired value.
	*/

	var implementations = [{
		name: 'The Nation',
		match: "^https?://www.thenation.com/.*",
		remove: '#paywall',
		wait: '#paywall',
		bmmode: function() { Paywall.hide(); }
	}, {
		name: 'Wall Street Journal',
		match: "^https?://www.wsj.com/.*",
		referer: 'http://www.google.com',
		replace: '#article_sector > article > div:nth-of-type(1)'
	}, {
		name: 'Boston Globe',
		match: "^https?://www.bostonglobe.com/.*",
		css: {
			'html, body, #contain': {
				overflow: 'visible'
			},
			'.mfp-wrap, .mfp-ready': {
				display: 'none'
			}
		}
	}];

	// END OF IMPLEMENTATIONS

	var Util = {
		log: function () {
			var args = [].slice.call(arguments);
			args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');
			console.log.apply(console, args);
		},
		q: function(query, context) {
			return (context || document).querySelector(query);
		},
		qq: function(query, context) {
			return [].slice.call((context || document).querySelectorAll(query));
		}
	};

	var App = {
		currentImpName: null,
		
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

		bypass: function(imp) {
			if (W.BM_MODE && imp.bmmode) {
				imp.bmmode();
			}
			if (imp.css) {
				var cssObj = typeof imp.css === 'function' ? imp.css() : imp.css;
				App.appendStyle(cssObj);
			}
			if (imp.remove) {
				var elemToRemove = typeof imp.remove === 'function' ? imp.remove() : Util.q(imp.remove);
				elemToRemove.remove();
			}
			if (imp.referer) {
				var theReferer = typeof imp.referer === 'function' ? imp.referer() : imp.referer;
				GM_xmlhttpRequest ({
					method: 'GET',
					url: W.location.href,
					headers: {
						referer: theReferer
					},
					anonymous: true,
					onload: function(response) {
						Util.log('successfully loaded xhr with referer: ' + theReferer);
						if (imp.replace) {
							var replaceSelector = typeof imp.replace === 'function' ? imp.replace() : imp.replace;
							
							var tempDiv = document.createElement('div');
							tempDiv.innerHTML = response.responseText;
							
							Util.q(replaceSelector).innerHTML = Util.q(replaceSelector, tempDiv).innerHTML;
						} else {
							document.body.innerHTML = response.responseText;
						}
					},
					onerror: function(error) {
						Util.log('error occured when loading xhr with referer: ' + theReferer, 'error');
					}
				});
			}
		},

		waitAndBypass: function(imp) {
			if (imp.wait) {
				var waitType = typeof imp.wait;
				if(waitType === 'number') {
					setTimeout(App.bypass(imp), imp.wait || 0);
				} else {
					var isReady = waitType === 'function' ? imp.wait : function() {
						return Util.q(imp.wait);
					};
					var intervalId = setInterval(function() {
						if(isReady()) {
							Util.log('Condition fulfilled, bypassing');
							clearInterval(intervalId);
							App.bypass(imp);
						}
					}, 200);
				}
			} else {
				App.bypass(imp);
			}
		},

		start: function(imps) {
			Util.log('starting...');
			var success = imps.some(function(imp) {
				if (imp.match && (new RegExp(imp.match, 'i')).test(W.location.href)) {
					currentImpName = imp.name;
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
