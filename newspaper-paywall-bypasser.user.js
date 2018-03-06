// ==UserScript==
// @name         Newspaper Paywall Bypasser
// @namespace    https://greasyfork.org/users/649
// @version      1.2.2
// @description  Bypass the paywall on online newspapers
// @author       Adrien Pyke
// @match        *://www.thenation.com/article/*
// @match        *://www.wsj.com/articles/*
// @match        *://blogs.wsj.com/*
// @match        *://www.bostonglobe.com/*
// @match        *://www.nytimes.com/*
// @match        *://myaccount.nytimes.com/mobile/wall/smart/*
// @match        *://mobile.nytimes.com/*
// @match        *://www.latimes.com/*
// @match        *://www.washingtonpost.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @noframes
// ==/UserScript==

(() => {
	'use strict';

	// short reference to unsafeWindow (or window if unsafeWindow is unavailable e.g. bookmarklet)
	let W = (typeof unsafeWindow === 'undefined') ? window : unsafeWindow;
	const SCRIPT_NAME = 'Newspaper Paywall Bypasser';

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
		getQueryParameter(name, url = W.location.href) {
			name = name.replace(/[[\]]/g, '\\$&');
			let regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		},
		appendStyle(css) {
			let out = '';
			for (let selector in css) {
				out += `${selector}{`;
				for (let rule in css[selector]) {
					out += `${rule}:${css[selector][rule]}!important;`;
				}
				out += '}';
			}

			let style = document.createElement('style');
			style.type = 'text/css';
			style.appendChild(document.createTextNode(out));
			document.head.appendChild(style);
		},
		clearAllIntervals() {
			let interval_id = window.setInterval(null, 9999);
			for (let i = 1; i <= interval_id; i++) {
				window.clearInterval(i);
			}
		},
		hijackScrollEvent(cb) {
			document.onscroll = e => {
				if (cb) {
					cb(e);
				}
				e.preventDefault();
				e.stopImmediatePropagation();
				return false;
			};
		},
		addScript(src, onload) {
			let s = document.createElement('script');
			s.onload = onload;
			s.src = src;
			document.body.appendChild(s);
		},
		prepend(parent, child) {
			parent.insertBefore(child, parent.firstChild);
		}
	};

	// GM_xmlhttpRequest polyfill
	if (typeof GM_xmlhttpRequest === 'undefined') {
		Util.log('Adding GM_xmlhttpRequest polyfill');
		W.GM_xmlhttpRequest = function(config) {
			let xhr = new XMLHttpRequest();
			xhr.open(config.method || 'GET', config.url);
			if (config.headers) {
				for (let header in config.headers) {
					xhr.setRequestHeader(header, config.headers[header]);
				}
			}
			if (config.anonymous) {
				xhr.setRequestHeader('Authorization', '');
			}
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
		fn: function() { }, // a function to run before doing anything else for more complicated logic
		afterReplace: function() { } // a function that runs after the replace is done
	}
	* Any of the CSS selectors can be functions instead that return the desired value.
	*/

	const implementations = [
		{
			name: 'The Nation',
			match: '^https?://www\\.thenation\\.com/article/.*',
			remove: '#paywall',
			wait: '#paywall',
			bmmode() { W.Paywall.hide(); }
		}, {
			name: 'Wall Street Journal',
			match: '^https?://.*\\.wsj\\.com/.*',
			wait: '.wsj-snippet-login',
			referer: 'https://t.co/T1323aaaa',
			afterReplace() {
				W.loadCSS('//asset.wsj.net/public/extra.production-2a7a40d6.css');
				let scripts = Util.qq('script');
				let add = function(regex, onload) {
					let matching = scripts.filter(script => {
						return script.src.match(regex);
					});
					if (matching.length > 0) {
						Util.addScript(matching[0].src, onload);
					} else {
						onload();
					}
				};
				add(/\/common\\.js$/i, () => {
					add(/\/article\\.js$/i, () => {
						add(/\/snippet\\.js$/i);
					});
				});
			}
		}, {
			name: 'Boston Globe',
			match: '^https?://www\\.bostonglobe\\.com/.*',
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
			match: '^https?://www\\.nytimes\\.com/.*',
			css: {
				'html, body': {
					overflow: 'visible'
				},
				'#Gateway_optly, #overlay': {
					display: 'none'
				},
				'.media .image': {
					'margin-bottom': '7px'
				},
				'.new-story-body-text': {
					'font-size': '1.0625rem',
					'line-height': '1.625rem'
				}
			},
			cleanupStory(story) {
				if (story) {
				// prevent payywall from finding the elements to remove
					Util.qq('figure', story).forEach(figure => {
						figure.outerHTML = figure.outerHTML.replace(/<figure/, '<div').replace(/<\/figure/, '</div');
					});
					Util.qq('.story-body-text', story).forEach(paragraph => {
						paragraph.classList.remove('story-body-text');
						paragraph.classList.add('new-story-body-text');
					});
				}
				return story;
			},
			bmmode() {
				let self = this;
				Util.clearAllIntervals();
				GM_xmlhttpRequest({
					url: W.location.href,
					method: 'GET',
					onload(response) {
						let tempDiv = document.createElement('div');
						tempDiv.innerHTML = response.responseText;
						let story = self.cleanupStory(Util.q('#story', tempDiv));
						if (story) {
							Util.q('#story').innerHTML = story.innerHTML;
						}
					}
				});
			},
			fn() {
			// clear intervals once the paywall comes up to prevent changes afterward
				waitForElems({
					sel: '#Gateway_optly',
					stop: true,
					onmatch: Util.clearAllIntervals
				});

				this.cleanupStory(Util.q('#story'));
				setTimeout(() => {
					W.require(['jquery/nyt'], $ => {
						W.require(['vhs'], vhs => {
							Util.qq('.video').forEach(video => {
								video.setAttribute('style', 'position: relative');
								let bind = document.createElement('div');
								bind.classList.add('video-bind');
								let div = document.createElement('div');
								div.setAttribute('style', 'padding-bottom: 56.25%; position: relative; overflow: hidden;');
								bind.appendChild(div);
								Util.prepend(video, bind);
								vhs.player({
									id: video.dataset.videoid,
									container: $(div),
									width: '100%',
									height: '100%',
									mode: 'html5',
									controlsOverlay: {
										mode: 'article'
									},
									cover: {
										mode: 'article'
									},
									newControls: true
								});
							});
						});
					});
				}, 0);
			}
		}, {
			name: 'NY Times Mobile Redirect',
			match: '^https?://myaccount\\.nytimes\\.com/mobile/wall/smart/.*',
			fn() {
				let article = Util.getQueryParameter('EXIT_URI');
				if (article) {
					W.location.replace(`http://mobile.nytimes.com?LOAD_ARTICLE=${encodeURIComponent(article)}`);
				}
			}
		}, {
			name: 'NY Times Mobile Loader',
			match: '^https?://mobile\\.nytimes\\.com',
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
			replace() {
				if (this.repalceUsing) {
					return '.sect';
				}
				return null;
			},
			replaceWith() {
				if (this.repalceUsing) {
					return 'article';
				}
				return null;
			}
		}, {
			name: 'LA Times',
			match: '^https?://www\\.latimes\\.com/.*',
			css: {
				'div#reg-overlay': {
					display: 'none'
				},
				'html, body': {
					overflow: 'visible'
				}
			},
			fn: Util.hijackScrollEvent
		}, {
			name: 'Washington Post',
			match: '^https?://www\\.washingtonpost\\.com/.*',
			css: {
				'.wp_signin, #wp_Signin': {
					display: 'none'
				},
				'html, body': {
					overflow: 'visible'
				}
			},
			fn() {
				let handler = e => {
					e.stopImmediatePropagation();
				};
				document.addEventListener('keydown', handler, true);
				document.addEventListener('mousewheel', handler, true);
			}
		}
	];
	// END OF IMPLEMENTATIONS

	const Config = {
		load() {
			let defaults = {
				blacklist: {}
			};

			let cfg = GM_getValue('cfg');
			if (!cfg) return defaults;

			cfg = JSON.parse(cfg);
			Object.entries(defaults).forEach(([key, value]) => {
				if (typeof cfg[key] === 'undefined') {
					cfg[key] = value;
				}
			});

			return cfg;
		},

		save(cfg) {
			GM_setValue('cfg', JSON.stringify(cfg));
		},

		toggleBlacklist(imp) {
			let cfg = Config.load();
			if (cfg.blacklist[imp]) {
				cfg.blacklist[imp] = false;
			} else {
				cfg.blacklist[imp] = true;
			}
			Config.save(cfg);
		}
	};

	const App = {
		currentImpName: null,

		bypass(imp) {
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
				let cssObj = typeof imp.css === 'function' ? imp.css() : imp.css;
				Util.appendStyle(cssObj);
			}
			if (imp.remove) {
				Util.log('Removing elements');
				let elemsToRemove = typeof imp.remove === 'function' ? imp.remove() : Util.qq(imp.remove);
				elemsToRemove.forEach(elem => {
					elem.remove();
				});
			}

			let replaceSelector = typeof imp.replace === 'function' ? imp.replace() : imp.replace;
			let replaceUsing = typeof imp.replaceUsing === 'function' ? imp.replaceUsing() : imp.replaceUsing;
			let theReferer = typeof imp.referer === 'function' ? imp.referer() : imp.referer;
			if (replaceSelector || replaceUsing || theReferer) {
				replaceUsing = replaceUsing || W.location.href;

				Util.log(`Loading xhr for "${replaceUsing}" with referer: ${theReferer}`);
				GM_xmlhttpRequest({
					method: 'GET',
					url: replaceUsing,
					headers: {
						referer: theReferer
					},
					anonymous: true,
					onload(response) {
						if (replaceSelector) {
							let replaceWithSelector = typeof imp.replaceWith === 'function' ? imp.replaceWith() : imp.replaceWith;
							replaceWithSelector = replaceWithSelector || replaceSelector;

							let tempDiv = document.createElement('div');
							tempDiv.innerHTML = response.responseText;

							Util.q(replaceSelector).innerHTML = Util.q(replaceWithSelector, tempDiv).innerHTML;
						} else {
							document.body.innerHTML = response.responseText;
						}
						if (imp.afterReplace) {
							Util.log('Performing after replace logic');
							imp.afterReplace();
						}
					},
					onerror() {
						Util.log('error occured when loading xhr');
					}
				});
			}
			Util.log('Paywall Bypassed.');
		},

		waitAndBypass(imp) {
			if (imp.wait) {
				let waitType = typeof imp.wait;
				if (waitType === 'number') {
					setTimeout(App.bypass(imp), imp.wait || 0);
				} else {
					let wait = waitType === 'function' ? imp.wait() : imp.wait;
					waitForElems({
						sel: wait,
						stop: true,
						onmatch() {
							Util.log('Condition fulfilled, bypassing');
							App.bypass(imp);
						}
					});
				}
			} else {
				App.bypass(imp);
			}
		},

		start(imps) {
			Util.log('starting...');
			let success = imps.some(imp => {
				if (imp.match && (new RegExp(imp.match, 'i')).test(W.location.href)) {
					App.currentImpName = imp.name;
					if (W.BM_MODE) {
						App.waitAndBypass(imp);
					} else {
						let menuCommandText;
						if (!Config.load().blacklist[imp.name]) {
							menuCommandText = `Disable ${SCRIPT_NAME} for ${imp.name}`;
							App.waitAndBypass(imp);
						} else {
							menuCommandText = `Enable ${SCRIPT_NAME} for ${imp.name}`;
							Util.log(`${imp.name} blacklisted`);
						}
						GM_registerMenuCommand(menuCommandText, () => {
							Config.toggleBlacklist(imp.name);
							location.reload();
						});
					}
					return true;
				}
			});

			if (!success) {
				Util.log(`no implementation for ${W.location.href}`, 'error');
			}
		}
	};

	App.start(implementations);
})();
