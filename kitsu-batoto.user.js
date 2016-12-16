// ==UserScript==
// @name         Kitsu Batoto Links
// @namespace    https://greasyfork.org/users/649
// @version      2.0
// @description  Adds Batoto links to Kitsu manga pages
// @author       Adrien Pyke
// @match        *://kitsu.io/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'Kitsu Batoto Links';
	var MANGA_REGEX = /^https?:\/\/kitsu\.io\/manga\/[^\/]+\/?(?:\?.*)?$/;

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
		},
	};

	var App = {
		cache: {},
		getBatotoPage: function(title, cb) {
			var self = this;
			if (self.cache.hasOwnProperty(title)) {
				Util.log('Loading cached info');
				cb(self.cache[title]);
			} else {
				var url = 'https://www.google.com/search?q=' + encodeURIComponent(title.trim() + ' site:bato.to/comic/_/comics');
				Util.log('Searching google for batoto page: ', url);
				GM_xmlhttpRequest({
					method: 'GET',
					url: url,
					onload: function(response) {
						Util.log('Loaded batoto google search');
						var tempDiv = document.createElement('div');
						tempDiv.innerHTML = response.responseText;

						var manga = Util.q('#rso > div > div:nth-child(1) h3 > a', tempDiv);
						if (manga) {
							manga.href = manga.href.replace('http', 'https');
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
						Util.log('Error searching google');
					}
				});
			}
		}
	};

	waitForUrl(MANGA_REGEX, function() {
		waitForElems('.cover-username', function(title) {
			var followGroup = document.querySelector('.cover-cta');
			var formCheck = document.querySelector('.cover-cta form');
			var formGroup = Util.q('.cover-cta', followGroup);
			var btnGroup;
			if (formCheck) {
				followGroup.removeChild(formCheck);
			}
			var url = location.href;
			App.getBatotoPage(Util.shallowTextContent(title), function(manga) {
				if (location.href === url && manga) {
					formGroup = document.createElement('form');
					formGroup.setAttribute('style', 'display: inline-block;');
					formGroup.setAttribute('target', '_blank');
					followGroup.appendChild(formGroup);
					btnGroup = document.createElement('button');
					btnGroup.classList.add('button');
					btnGroup.classList.add('button--primary');
					btnGroup.textContent = "Batoto";
					formGroup.appendChild(btnGroup);
					formGroup.setAttribute('action', manga);
				}
			});
		}, true);
	});
})();