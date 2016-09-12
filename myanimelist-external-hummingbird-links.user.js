// ==UserScript==
// @name         MyAnimeList, External Hummingbird Links
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Adds a link to the Hummingbird page in the External Links section
// @author       Adrien Pyke
// @match        *://myanimelist.net/anime/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'MyAnimeList, External Hummingbird Links';
	var API = 'https://hummingbird.me/api/v2';
	var API_KEY = 'efdefcef5c444cf7b2ef';

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
			Util.log('Fetching Hummingbird ID for MAL ID:', malid);
			GM_xmlhttpRequest({
				method: 'GET',
				url: API + '/anime/myanimelist:' + malid,
				headers: {
					'X-Client-Id': API_KEY
				},
				onload: function(response) {
					try {
						var json = JSON.parse(response.responseText);
						Util.log('Hummingbird ID:', json.anime.slug);
						cb('https://hummingbird.me/anime/' + json.anime.slug);
					} catch (err) {
						Util.log('Failed to parse API results');
					}
				},
				onerror: function() {
					Util.log('Failed to get Hummingbird ID');
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
			a.textContent = 'Hummingbird';
			a.href = href;
			a.setAttribute('target', '_blank');
			container.appendChild(a);
		});
	}
})();
