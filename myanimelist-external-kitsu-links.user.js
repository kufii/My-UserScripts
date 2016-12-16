// ==UserScript==
// @name         MyAnimeList, External Kitsu Links
// @namespace    https://greasyfork.org/users/649
// @version      2.0
// @description  Adds a link to the Kitsu page in the External Links section
// @author       Adrien Pyke
// @match        *://myanimelist.net/anime/*
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
		getHummingbirdLink: function(malid, cb) {
			Util.log('Fetching Kitsu ID for MAL ID:', malid);
			GM_xmlhttpRequest({
				method: 'GET',
				url: API + '/mappings?filter[external_site]=myanimelist/anime&filter[external_id]=' + malid,
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
									cb('https://kitsu.io/anime/' + json.data.attributes.slug);
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

	var match = location.href.match(/^https?:\/\/myanimelist\.net\/anime\/([0-9]+)/i);
	if (match) {
		var id = match[1];
		App.getHummingbirdLink(id, function(href) {
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
