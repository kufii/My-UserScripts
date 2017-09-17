// ==UserScript==
// @name         Kitsu Batoto Links
// @namespace    https://greasyfork.org/users/649
// @version      2.0.5
// @description  Adds Batoto links to Kitsu manga pages
// @author       Adrien Pyke
// @match        *://kitsu.io/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'Kitsu Batoto Links';
	var REGEX = /^https?:\/\/kitsu\.io\/manga\/[^\/]+\/?(?:\?.*)?$/;

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
		encodeQuery: function(query) {
			return encodeURIComponent(query.trim().replace(/\s+/g, ' ').replace('!', '"!"'));
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
				var url = 'https://duckduckgo.com/html/?q=' + Util.encodeQuery(title + ' site:bato.to/comic/_/comics');
				Util.log('Searching DuckDuckGo for Batoto page:', url);
				GM_xmlhttpRequest({
					method: 'GET',
					url: url,
					onload: function(response) {
						var tempDiv = document.createElement('div');
						tempDiv.innerHTML = response.responseText;

						var manga = Util.q('#links > div.result:not(.result--no-result) .result__extras__url > a.result__url', tempDiv);
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
						Util.log('Error searching DuckDuckGo');
					}
				});
			}
		}
	};

	waitForUrl(REGEX, function() {
		waitForElems({
			sel: '.media-sidebar',
			stop: true,
			onmatch: function(node) {
				var title = Util.q('.media--title h3');
				var url = location.href;
				App.getBatotoPage(title.textContent, function(manga) {
					var check = Util.q('.where-to-watch-widget');
					if (!manga && check) check.remove();

					if (location.href === url && manga) {
						if (check) {
							var updateLink = Util.q('#batoto-link');
							updateLink.href = manga;
						} else {
							var section = document.createElement('div');
							section.className = 'where-to-watch-widget';

							var header = document.createElement('span');
							header.className = 'where-to-watch-header';
							var headerText = document.createElement('span');
							headerText.textContent = 'Read Online';
							header.appendChild(headerText);
							section.appendChild(header);

							var listWrap = document.createElement('ul');
							listWrap.className = 'nav';
							var list = document.createElement('li');
							listWrap.appendChild(list);
							section.appendChild(listWrap);

							var link = document.createElement('a');
							link.id = 'batoto-link';
							link.href = manga;
							link.target = '_blank';
							link.rel = 'noopener noreferrer';
							link.setAttribute('aria-label', 'Batoto');
							link.className = 'hint--top hint--bounce hint--rounded';
							var img = document.createElement('img');
							img.src = 'https://my.mixtape.moe/ettnpe.png';
							img.style.verticalAlign = 'text-bottom';
							link.appendChild(img);
							list.appendChild(link);

							node.appendChild(section);
						}
					}
				});
			}
		});
	});
})();
