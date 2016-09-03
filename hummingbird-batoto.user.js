// ==UserScript==
// @name         Hummingbird Batoto Links
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Adds Batoto links to Hummingbird Manga pages
// @author       Adrien Pyke
// @match        *://hummingbird.me/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'Hummingbird Batoto Links';
	var MANGA_REGEX = /^https?:\/\/hummingbird\.me\/manga\/[^\/]+\/?(?:\?.*)?$/;

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
		},
		shallowTextContent: function(elem) {
			var child = elem.firstChild;
			var texts = [];

			while (child) {
				if (child.nodeType == 3) {
					texts.push(child.data);
				}
				child = child.nextSibling;
			}

			return texts.join('');
		}
	};

	var App = {
		cache: {},
		getBatotoPage: function(title, cb) {
			var self = this;
			if (self.cache.hasOwnProperty(title)) {
				Util.log('Loading cached info');
				cb(self.cache[title]);
			} else {
				Util.log('Searching Batoto');
				GM_xmlhttpRequest({
					method: 'GET',
					url: 'https://bato.to/search?name=' + encodeURIComponent(title.trim()),
					onload: function(response) {
						Util.log('Laoded batoto search');
						var tempDiv = document.createElement('div');
						tempDiv.innerHTML = response.responseText;

						var manga = Util.q('#comic_search_results > table > tbody > tr:nth-child(2) > td:nth-child(1) > strong > a', tempDiv);
						if (manga) {
							Util.log(manga.href);
							self.cache[title] = manga.href;
							cb(manga.href);
						} else {
							Util.log('No results');
							self.cache[title] = null;
							cb(null);
						}
					},
					onerror: function() {
						Util.log('Error searching batoto');
					}
				});
			}
		}
	};

	waitForUrl(MANGA_REGEX, function() {
		waitForElems('.series-title', function(title) {
			var btnGroup = Util.q('.btn-group', title);
			if (btnGroup) {
				btnGroup.innerHTML = '';
			} else {
				btnGroup = document.createElement('div');
				btnGroup.classList.add('btn-group');
				title.appendChild(btnGroup);
			}
			var url = location.href;
			App.getBatotoPage(Util.shallowTextContent(title), function(manga) {
				if (location.href === url) {
					var link = document.createElement('a');
					link.href = manga;
					link.setAttribute('target', '_blank');
					var icon = document.createElement('i');
					icon.classList.add('fa', 'fa-book');
					link.appendChild(icon);
					btnGroup.appendChild(link);
				}
			});
		}, true);
	});
})();