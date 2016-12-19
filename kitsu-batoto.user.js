// ==UserScript==
// @name         Kitsu Batoto Links
// @namespace    https://greasyfork.org/users/649
// @version      2.0.1
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
				Util.log('Searching Google for Batoto page:', url);
				GM_xmlhttpRequest({
					method: 'GET',
					url: url,
					onload: function(response) {
						Util.log('Loaded Google search');
						var tempDiv = document.createElement('div');
						tempDiv.innerHTML = response.responseText;

						var manga = Util.q('#rso > div > div:nth-child(1) h3 > a', tempDiv);
						if (manga) {
							manga.href = manga.href.replace('http://', 'https://');
							Util.log('Batoto link:', manga.href);
							self.cache[title] = manga.href;
							cb(manga.href);
						} else {
							Util.log('No results found');
							self.cache[title] = null;
							cb(null);
						}
					},
					onerror: function() {
						Util.log('Error searching Google');
					}
				});
			}
		}
	};

	waitForUrl(MANGA_REGEX, function() {
		waitForElems('.media-cover-wrapper .cover-username', function(title) {
			var followGroup = Util.q('.media-cover-wrapper .cover-cta');
			var linkCheck = Util.q('a', followGroup);
			if (linkCheck) {
				followGroup.removeChild(linkCheck);
			}

			var url = location.href;
			App.getBatotoPage(Util.shallowTextContent(title), function(manga) {
				if (location.href === url && manga) {
					var linkElem = document.createElement('a');
					linkElem.setAttribute('style', 'display: inline-block;');
					linkElem.setAttribute('target', '_blank');
					linkElem.href = manga;
					followGroup.appendChild(linkElem);
					var btnElem = document.createElement('button');
					btnElem.classList.add('button');
					btnElem.classList.add('button--primary');
					btnElem.textContent = "Batoto";
					btnElem.setAttribute('style', 'margin-top: 0.5px;');
					linkElem.appendChild(btnElem);
				}
			});
		}, true);
	});
})();