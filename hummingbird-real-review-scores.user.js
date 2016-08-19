// ==UserScript==
// @name         Hummingbird Real Review Scores
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Show that actual review score instead of like/dislike in review quotes
// @author       Adrien Pyke
// @match        *://hummingbird.me/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
	'use strict';

	var Config = {
		load: function() {
			var defaults = {
				scoreType: 'stars'
			};

			var cfg = GM_getValue('cfg');
			if (!cfg) return defaults;

			cfg = JSON.parse(cfg);
			for (var property in defaults) {
				if (defaults.hasOwnProperty(property)) {
					if (!cfg[property]) {
						cfg[property] = defaults[property];
					}
				}
			}

			return cfg;
		},

		save: function (cfg) {
			GM_setValue('cfg', JSON.stringify(cfg));
		},

		setup: function() {
			var createContainer = function() {
				var div = document.createElement('div');
				div.style.backgroundColor = 'white';
				div.style.padding = '5px';
				div.style.border = '1px solid black';
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.right = '0';
				div.style.zIndex = 99999;
				return div;
			};

			var createSelect = function(label, options, value) {
				var select = document.createElement('select');
				select.style.margin = '2px';
				var optgroup = document.createElement('optgroup');
				if (label) {
					optgroup.setAttribute('label', label);
				}
				select.appendChild(optgroup);
				options.forEach(function(opt) {
					var option = document.createElement('option');
					option.setAttribute('value', opt.value);
					option.textContent = opt.text;
					optgroup.appendChild(option);
				});
				select.value = value;
				return select;
			};

			var createButton = function(text, onclick) {
				var button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};

			var createLabel = function(label) {
				var lbl = document.createElement('span');
				lbl.textContent = label;
				return lbl;
			};

			var createLineBreak = function() {
				return document.createElement('br');
			};

			var init = function(cfg) {
				var div = createContainer();

				var scoreType = createSelect('Score Type', [
					{ value: 'stars', text: 'Five Stars' },
					{ value: 'ten', text: '10 Points' }
				], cfg.scoreType);
				div.appendChild(createLabel('Score Type: '));
				div.appendChild(scoreType);
				div.appendChild(createLineBreak());

				div.appendChild(createButton('Save', function(e) {
					var settings = {
						scoreType: scoreType.value
					};
					Config.save(settings);
					div.remove();
				}));

				div.appendChild(createButton('Cancel', function(e) {
					div.remove();
				}));

				document.body.appendChild(div);
			};
			init(Config.load());
		}
	};
	GM_registerMenuCommand('Hummingbird Real Review Scores Settings', Config.setup);

	var App = {
		cache: {},
		getReviewScore: function(url, cb) {
			var self = this;
			var id = url.match(/\/([0-9]+)\/?(?:\?.*)?$/)[1];
			if (self.cache[id]) {
				cb(self.cache[id]);
			} else {
				GM_xmlhttpRequest({
				method: 'GET',
				url: url,
				onload: function(response) {
					var match = response.responseText.match(/window\.preloadData = (.*);\n/);
					if (match) {
						var data = JSON.parse(match[1])[2].reviews[0];
						self.cache[id] = data.rating;
						cb(data.rating);
					}
				}
			});
			}
		}
	};

	var cfg = Config.load();

	waitForElems('.review-quote',  function(review) {
		var rating = review.querySelector('.quick-rating');
		var isPositive = rating.querySelector('i').classList.contains('fa-smile-o');
		var link = review.querySelector('.full-review a');
		App.getReviewScore(link.href, function(score) {
			var color = isPositive ? '#16a085' : '#c0392b';
			score = (cfg.scoreType === 'stars') ? score : parseInt(score * 2);
			rating.innerHTML = '<span style="font-weight: bold; color: ' + color + ';">' + score + '</span>';
		});
	});
})();
