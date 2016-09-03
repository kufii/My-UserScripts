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

			var text = texts.join('');
		}
	};

	var App = {
		cache: {},
		getBatotoPage: function(title, cb) {
			var self = this;
			if (self.cache[title]) {
				return cb(self.cache(title));
			} else {
				GM_xmlhttpRequest({

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
			}
		}, true);
	});
})();