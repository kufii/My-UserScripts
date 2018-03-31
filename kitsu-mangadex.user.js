// ==UserScript==
// @name         Kitsu MangaDex Links
// @namespace    https://greasyfork.org/users/649
// @version      3.0.0
// @description  Adds MangaDex links to Kitsu manga pages
// @author       Adrien Pyke
// @match        *://kitsu.io/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(() => {
	'use strict';

	let SCRIPT_NAME = 'Kitsu MangaDex Links';
	let REGEX = /^https?:\/\/kitsu\.io\/manga\/[^/]+\/?(?:\?.*)?$/;

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
		encodeQuery(query) {
			return encodeURIComponent(query.trim().replace(/\s+/g, ' ').replace('!', '"!"'));
		}
	};

	const App = {
		cache: {},
		getBatotoPage(title, cb) {
			let self = this;
			if (self.cache[title]) {
				Util.log('Loading cached info');
				cb(self.cache[title]);
			} else {
				let url = `https://duckduckgo.com/html/?q=${Util.encodeQuery(`${title} site:bato.to/comic/_/comics`)}`;
				Util.log('Searching DuckDuckGo for Batoto page:', url);
				GM_xmlhttpRequest({
					method: 'GET',
					url,
					onload(response) {
						let tempDiv = document.createElement('div');
						tempDiv.innerHTML = response.responseText;

						let manga = Util.q('#links > div.result:not(.result--no-result) .result__extras__url > a.result__url', tempDiv);
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
					onerror() {
						Util.log('Error searching DuckDuckGo');
					}
				});
			}
		}
	};

	waitForUrl(REGEX, () => {
		waitForElems({
			sel: '.media-sidebar',
			stop: true,
			onmatch(node) {
				let title = Util.q('.media--title h3');
				let url = location.href;
				App.getBatotoPage(title.textContent, manga => {
					let check = Util.q('.where-to-watch-widget');
					if (!manga && check) check.remove();

					if (location.href === url && manga) {
						if (check) {
							let updateLink = Util.q('#batoto-link');
							updateLink.href = manga;
						} else {
							let section = document.createElement('div');
							section.className = 'where-to-watch-widget';

							let header = document.createElement('span');
							header.className = 'where-to-watch-header';
							let headerText = document.createElement('span');
							headerText.textContent = 'Read Online';
							header.appendChild(headerText);
							section.appendChild(header);

							let listWrap = document.createElement('ul');
							listWrap.className = 'nav';
							let list = document.createElement('li');
							listWrap.appendChild(list);
							section.appendChild(listWrap);

							let link = document.createElement('a');
							link.id = 'batoto-link';
							link.href = manga;
							link.target = '_blank';
							link.rel = 'noopener noreferrer';
							link.setAttribute('aria-label', 'Batoto');
							link.className = 'hint--top hint--bounce hint--rounded';
							let img = document.createElement('img');
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
