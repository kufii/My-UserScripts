// ==UserScript==
// @name         Greasy Fork - Change Default Script Sort on User Profiles
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Change default script sort on user profiles
// @author       Adrien Pyke
// @match        *://greasyfork.org/en/users/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
	'use strict';

	var Util = {
		getQueryParameter: function(name, url) {
			if (!url) url = window.location.href;
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		},

		updateQueryString: function(key, value, url) {
			if (!url) url = window.location.href;
			var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
				hash;

			if (re.test(url)) {
				if (typeof value !== 'undefined' && value !== null)
					return url.replace(re, '$1' + key + "=" + value + '$2$3');
				else {
					hash = url.split('#');
					url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
					if (typeof hash[1] !== 'undefined' && hash[1] !== null)
						url += '#' + hash[1];
					return url;
				}
			}
			else {
				if (typeof value !== 'undefined' && value !== null) {
					var separator = url.indexOf('?') !== -1 ? '&' : '?';
					hash = url.split('#');
					url = hash[0] + separator + key + '=' + value;
					if (typeof hash[1] !== 'undefined' && hash[1] !== null)
						url += '#' + hash[1];
					return url;
				}
				else
					return url;
			}
		}
	};

	var Config = {
		load: function() {
			var defaults = {
				sort: 'daily-installs'
			};

			var cfg = GM_getValue('cfg');
			if (!cfg) return defaults;

			return JSON.parse(cfg);
		},

		save: function (cfg) {
			GM_setValue('cfg', JSON.stringify(cfg));
		},

		setup: function() {
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

			var init = function(cfg) {
				var div = document.createElement('div');
				div.style.backgroundColor = 'white';
				div.style.border = '1px solid black';
				div.style.position = 'absolute';
				div.style.top = '0';
				div.style.right = '0';

				var sort = createSelect('Default Sort', [
					{ value: 'daily-installs', text: 'Daily installs' },
					{ value: 'total_installs', text: 'Total installs' },
					{ value: 'ratings', text: 'Ratings' },
					{ value: 'created', text: 'Created' },
					{ value: 'updated', text: 'Updated' },
					{ value: 'name', text: 'Name' }
				], cfg.sort);
				div.appendChild(sort);

				div.appendChild(document.createElement('br'));

				div.appendChild(createButton('Save', function(e) {
					var settings = {
						sort: sort.value
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

	GM_registerMenuCommand('GreasyFork Sort Settings', Config.setup);

	var dailyInstalls = document.querySelector('#script-list-sort > ul > li:nth-child(1) > a');
	if (dailyInstalls) {
		dailyInstalls.href = Util.updateQueryString('sort', 'daily-installs', dailyInstalls.href);
	}

	var sort = Util.getQueryParameter('sort');
	if (!sort) {
		var cfg = Config.load();
		window.location.href = Util.updateQueryString('sort', cfg.sort);
	}
})();
