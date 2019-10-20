// ==UserScript==
// @name         MyAnimeList, External Kitsu Links
// @namespace    https://greasyfork.org/users/649
// @version      2.2.3
// @description  Adds a link to the Kitsu page in the External Links section
// @author       Adrien Pyke
// @match        *://myanimelist.net/anime/*
// @match        *://myanimelist.net/manga/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(() => {
	'use strict';

	const SCRIPT_NAME = 'MyAnimeList, External Kitsu Links';
	const API = 'https://kitsu.io/api/edge';

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
		}
	};

	const App = {
		getKitsuLink(type, malid, cb) {
			GM_xmlhttpRequest({
				method: 'GET',
				url: `${API}/mappings?filter[external_site]=myanimelist/${type}&filter[external_id]=${malid}`,
				headers: {
					Accept: 'application/vnd.api+json'
				},
				onload(response) {
					try {
						const json = JSON.parse(response.responseText);
						GM_xmlhttpRequest({
							method: 'GET',
							url: `${API}/mappings/${json.data[0].id}/item?fields[${type}]=slug`,
							headers: {
								Accept: 'application/vnd.api+json'
							},
							onload(response) {
								try {
									const json = JSON.parse(response.responseText);
									if (type === 'anime') {
										cb(`https://kitsu.io/anime/${json.data.attributes.slug}`);
									} else if (type === 'manga') {
										cb(`https://kitsu.io/manga/${json.data.attributes.slug}`);
									}
								} catch (err) {
									Util.log('Failed to parse media API results');
								}
							},
							onerror() {
								Util.log('Failed to get Kitsu media slug');
							}
						});
					} catch (err) {
						Util.log('Failed to parse mapping API results');
					}
				},
				onerror() {
					Util.log('Failed to get Kitsu mapping ID');
				}
			});
		}
	};

	const match = location.href.match(/^https?:\/\/myanimelist\.net\/(anime|manga)\/([0-9]+)/iu);
	if (match) {
		const type = match[1];
		const id = match[2];
		App.getKitsuLink(type, id, href => {
			Util.log('Link:', href);
			const container = Util.q('#content > table > tbody > tr > td.borderClass .pb16');
			if (container) {
				container.appendChild(document.createTextNode(', '));

				const a = document.createElement('a');
				a.textContent = 'Kitsu';
				a.href = href;
				a.target = '_blank';
				a.rel = 'noopener';
				container.appendChild(a);
			} else {
				const sidebar = Util.q('#content > table > tbody > tr > td.borderClass > div');

				const header = document.createElement('h2');
				header.textContent = 'External Links';
				sidebar.appendChild(header);

				const links = document.createElement('div');
				links.classList.add('pb16');
				sidebar.appendChild(links);

				const b = document.createElement('a');
				b.textContent = 'Kitsu';
				b.href = href;
				b.target = '_blank';
				b.rel = 'noopener';
				links.appendChild(b);
			}
		});
	}
})();
