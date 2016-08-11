// ==UserScript==
// @name         Hummingbird User Compare
// @namespace    https://greasyfork.org/users/649
// @version      3.0.14
// @description  Adds a button that compares the anime list of a hummingbird user against yours
// @author       kufii, fuzetsu
// @match        http://hummingbird.me/*
// @match        http://forums.hummingbird.me/*
// @match        https://hummingbird.me/*
// @match        https://forums.hummingbird.me/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        none
// @noframes
// ==/UserScript==
(function() {
	'use strict';

	var SCRIPT_NAME = 'Hummingbird User Compare';
	var BTN_ID = 'us-compare-button';
	var COMPAT_ID = 'us-compat-table';
	var USERNAME_SELECTOR = 'h2.username,h1.username';
	var CACHE = {};

	var Util = {
		log: function() {
			var args = [].slice.call(arguments);
			args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold');
			console.log.apply(console, args);
		},
		q: function(query, context) {
			return (context || document).querySelector(query);
		},
		qq: function(query, context) {
			return [].slice.call((context || document).querySelectorAll(query));
		},
		shallowTextContent: function(elem) {
			var child = elem.firstChild,
					texts = [];

			while (child) {
				if (child.nodeType == 3) {
					texts.push(child.data);
				}
				child = child.nextSibling;
			}

			return texts.join("");
		},
		arrToTable: function(arr, opts) {
			// takes an object and converts to an html compliant list of attributes
			var makeAttrs = function(obj) {
				var str = '';
				var key;
				for(key in obj) {
					if(obj.hasOwnProperty(key)) {
						str += key + '="' + obj[key] + '" ';
					}
				}
				return str;
			};

			// creates an object of the specified type
			// either takes a config object with attributes and a value, or just the value directly
			var createElement = function(type, data) {
				if(typeof data === 'object') {
					return '<' + type +' ' + makeAttrs(data.attrs || {}) + '>' + data.value + '</' + type + '>';
				}
				return '<' + type + '>' + data + '</' + type + '>';
			};

			opts = opts || {};

			var headers = '';

			// if the table is going to have a head use the first row
			if(opts.hasHead) {
				headers = arr[0].map(function(header) {
					return createElement('th', header);
				}).join('');
				headers = '<thead>' + headers + '</thead>';
				arr = arr.slice(1);
			}

			// create the body of the array
			var rows = arr.map(function(row) {
				return '<tr>' + row.map(function(cell) {
					return createElement('td', cell);
				}).join('') + '</tr>';
			}).join('');

			// create and return the actual table all put together
			return createElement('table', {
				attrs: opts.attrs,
				value: (headers + '<tbody>' + rows + '</tbody>')
			});

		},
		getJSON: function(url, load, error) {
			var xhr = new XMLHttpRequest();
			xhr.open('get', url);
			xhr.responseType = 'json';
			xhr.onload = function() {
				load(xhr.response);
			};
			xhr.onerror = error;
			xhr.send();
		},
		titleCase: function(str) {
			return str.charAt(0).toUpperCase() + str.slice(1);
		}
	};

	var hb = {
		getCompareUrl: function() {
			var you = Util.q('.dropdown-menu > li > a').href.match(/users\/([^\/]+)\/library/i)[1];
			var them = Util.shallowTextContent(Util.q(USERNAME_SELECTOR)).trim();
			return {
				you: you,
				them: them,
				url: 'http://fuzetsu.github.io/hummingbird-user-compare/?user1=' + you + '&user2=' + them
			};
		},
		getCompatibility: function(callback) {
			var buffer = [];

			var process = function(data) {
				buffer.push(data);
				if(buffer.length === 2) { 
					var anime, manga;
					if (buffer[0].type === 'anime') {
						anime = buffer[0];
						manga = buffer[1];
					} else {
						anime = buffer[1];
						manga = buffer[0];
					}
					CACHE[you + '+' + them] = { anime: anime, manga: manga };
					callback(anime, manga);
				}
			};

			var compare = hb.getCompareUrl();
			var you = compare.you;
			var them = compare.them;

			var cached = CACHE[you + '+' + them];
			if(cached) {
				Util.log('using cached compat score');
				callback(cached.anime, cached.manga);
			}

			// get anime compat
			Util.getJSON('https://hbird-cmp-node.herokuapp.com/compatibility/anime?user1=' + you + '&user2=' + them, process);
			// get manga compat
			Util.getJSON('https://hbird-cmp-node.herokuapp.com/compatibility/manga?user1=' + you + '&user2=' + them, process);
		},
		makeCompatTable: function(compats, style) {
			var table = compats.map(function(compat) {
				var message = compat.phrase;
				if (compat.value) {
					message += ' (' + compat.percent+  ')';
				}
				return [
					{value: Util.titleCase(compat.type) + ' Compatibility:', attrs: {style: 'text-align: right; padding-right: 5px;'}},
					{value: message, attrs: {style: 'font-weight:bold'}}
				];
			});
			return Util.arrToTable(table, {
				hasHead: false,
				attrs: {
					style: 'position: absolute; bottom: -25px; right: 0;' + (style || ''),
					id: COMPAT_ID
				}
			});
		}
	};

	var lastUser;

	Util.log('Started, waiting for user page...');

	waitForUrl(/https:\/\/(forums\.)?hummingbird\.me\/users\/.+/, function() {
		// not signed in
		if(Util.q('.signup-cta')) return;

		var compatTable = Util.q('#' + COMPAT_ID);
		var btn = Util.q('#' + BTN_ID);

		// cleanup area
		if(lastUser && location.href.indexOf('/users/' + lastUser) === -1) {
			if(btn) btn.remove();
			if(compatTable) compatTable.remove();
		}

		Util.log('Found user page, waiting for button area...');
		waitForElems('.user-cover-options .follow-button:not(.' + BTN_ID + ')', function(btnFollow) {

			// exit early if you're on your own profile
			var compare = hb.getCompareUrl();
			if(location.href.indexOf('/users/' + compare.you) !== -1) {
				lastUser = compare.you;
				return;
			}

			// try getting forum button and fix it if we find it
			var forumButton = Util.q('.account-info .inline-list a');
			if(forumButton) {
				forumButton.title = '';
				forumButton.target = '_blank';
				forumButton.href = compare.url;
			}
			btn = forumButton || btn;

			var compatibilityCallback = function(anime, manga) {
				var styleOverride = '';
				if(forumButton) {
					styleOverride = 'bottom: 38px; width: 350px;';
				}
				btnFollow.parentNode.innerHTML += hb.makeCompatTable([anime, manga], styleOverride);
			};

			Util.log('Found button area, loading button and compat rating...');

			if(!btn) {
				btn = document.createElement('a');
				btn.className = btnFollow.className;
				btn.id = BTN_ID;
				btn.textContent = 'Compare';
				btn.target = '_blank';
				btn.setAttribute('style', 'right: ' + (btnFollow.clientWidth + 10) + 'px; background: rgb(236, 134, 97); color: white;');
			}
			if(compare.them === lastUser) {
				// if the current user is the same as last but the user url changed then wait for the username to update
				if(location.href.indexOf("/users/" + lastUser) === -1) {
					if (compatTable) {
						compatTable.remove();
					}
					var handler = function(e) {
						this.removeEventListener('DOMSubtreeModified', handler);
						compare = hb.getCompareUrl();
						btn.href = compare.url;
						if(!forumButton) {
							btnFollow.parentNode.appendChild(btn);
						}
						hb.getCompatibility(compatibilityCallback);
					};
					Util.q(USERNAME_SELECTOR).addEventListener('DOMSubtreeModified', handler);
				}
			} else {
				if (compatTable) {
					compatTable.remove();
				}
				btn.href = compare.url;
				if(!forumButton) {
					btnFollow.parentNode.appendChild(btn);
				}
				hb.getCompatibility(compatibilityCallback);
			}
			lastUser = compare.them;

		}, true);
	});
})();
