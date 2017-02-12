// ==UserScript==
// @name         MyAnimeList, External Kitsu Links
// @namespace    https://greasyfork.org/users/649
// @version      2.1
// @description  Adds a link to the Kitsu page in the External Links section
// @author       Adrien Pyke
// @match        *://myanimelist.net/anime/*
// @match        *://myanimelist.net/manga/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'MyAnimeList, External Kitsu Links';
	var API = 'https://kitsu.io/api/edge';

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
		}
	};

	var App = {
		getKitsuLink: function(type, malid, cb) {
			Util.log('Fetching Kitsu ID for MAL ID:', malid);
			GM_xmlhttpRequest({
				method: 'GET',
				url: API + '/mappings?filter[external_site]=myanimelist/' + type + '&filter[external_id]=' + malid,
				headers: {
					'Accept': 'application/vnd.api+json'
				},
				onload: function(response) {
					try {
						var json = JSON.parse(response.responseText);
						Util.log('Kitsu mapping ID:', json.data[0].id);
						GM_xmlhttpRequest({
							method: 'GET',
							url: API + '/mappings/' + json.data[0].id + '/media',
							headers: {
								'Accept': 'application/vnd.api+json'
							},
							onload: function(response) {
								try {
									var json = JSON.parse(response.responseText);
									Util.log('Kitsu slug:', json.data.attributes.slug);
									if (type == 'anime') {
										cb('https://kitsu.io/anime/' + json.data.attributes.slug);
									} else if (type == 'manga') {
										cb('https://kitsu.io/manga/' + json.data.attributes.slug);
									}
								} catch (err) {
									Util.log('Failed to parse media API results');
								}
							},
							onerror: function() {
								Util.log('Failed to get Kitsu media slug');
							}
						});
					} catch (err) {
						Util.log('Failed to parse mapping API results');
					}
				},
				onerror: function() {
					Util.log('Failed to get Kitsu mapping ID');
				}
			});
		}
	};

	var match = location.href.match(/^https?:\/\/myanimelist\.net\/(anime|manga)\/([0-9]+)/i);
	if (match) {
		var type = match[1];
		var id = match[2];
		App.getKitsuLink(type, id, function(href) {
			var container = Util.q('.pb16');
			if (container.innerHTML.trim()) {
				container.appendChild(document.createTextNode(', '));
			}
			var a = document.createElement('a');
			a.textContent = 'Kitsu';
			a.href = href;
			a.setAttribute('target', '_blank');
			container.appendChild(a);
		});
	}
})();
