// ==UserScript==
// @name         Greasy Fork - Change Default Script Sort
// @namespace    https://greasyfork.org/users/649
// @version      1.2
// @description  Change default script sort on GreasyFork
// @author       Adrien Pyke
// @match        *://greasyfork.org/*/users/*
// @match        *://greasyfork.org/*/scripts*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(() => {
	'use strict';

	const Util = {
		getQueryParameter(name, url) {
			if (!url) url = window.location.href;
			name = name.replace(/[[\]]/g, '\\$&');
			let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		},

		setQueryParameter(key, value, url) {
			if (!url) url = window.location.href;
			let re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi'),
				hash;

			if (re.test(url)) {
				if (typeof value !== 'undefined' && value !== null) return url.replace(re, '$1' + key + '=' + value + '$2$3');
				else {
					hash = url.split('#');
					url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
					if (typeof hash[1] !== 'undefined' && hash[1] !== null) url += '#' + hash[1];
					return url;
				}
			} else if (typeof value !== 'undefined' && value !== null) {
				let separator = url.indexOf('?') !== -1 ? '&' : '?';
				hash = url.split('#');
				url = hash[0] + separator + key + '=' + value;
				if (typeof hash[1] !== 'undefined' && hash[1] !== null) url += '#' + hash[1];
				return url;
			} else return url;
		}
	};

	const Config = {
		load() {
			let defaults = {
				all: 'daily-installs',
				search: 'relevance',
				user: 'daily-installs'
			};

			let cfg = GM_getValue('cfg');
			if (!cfg) return defaults;

			cfg = JSON.parse(cfg);
			for (let property in defaults) {
				if (defaults.hasOwnProperty(property)) {
					if (!cfg[property]) {
						cfg[property] = defaults[property];
					}
				}
			}

			return cfg;
		},

		save(cfg) {
			GM_setValue('cfg', JSON.stringify(cfg));
		},

		setup() {
			const createContainer = function() {
				let div = document.createElement('div');
				div.style.backgroundColor = 'white';
				div.style.padding = '5px';
				div.style.border = '1px solid black';
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.right = '0';
				div.style.zIndex = 99999;
				return div;
			};

			const createSelect = function(label, options, value) {
				let select = document.createElement('select');
				select.style.margin = '2px';
				let optgroup = document.createElement('optgroup');
				if (label) {
					optgroup.setAttribute('label', label);
				}
				select.appendChild(optgroup);
				options.forEach(opt => {
					let option = document.createElement('option');
					option.setAttribute('value', opt.value);
					option.textContent = opt.text;
					optgroup.appendChild(option);
				});
				select.value = value;
				return select;
			};

			const createButton = function(text, onclick) {
				let button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};

			const createLabel = function(label) {
				let lbl = document.createElement('span');
				lbl.textContent = label;
				return lbl;
			};

			const createLineBreak = function() {
				return document.createElement('br');
			};

			const init = function(cfg) {
				let div = createContainer();

				let all = createSelect('All Scripts Sort', [
					{ value: 'daily-installs', text: 'Daily installs' },
					{ value: 'total_installs', text: 'Total installs' },
					{ value: 'ratings', text: 'Ratings' },
					{ value: 'created', text: 'Created date' },
					{ value: 'updated', text: 'Updated date' },
					{ value: 'name', text: 'Name' }
				], cfg.all);
				div.appendChild(createLabel('All Scripts Sort: '));
				div.appendChild(all);
				div.appendChild(createLineBreak());

				let search = createSelect('Search Sort', [
					{ value: 'relevance', text: 'Relevance' },
					{ value: 'daily_installs', text: 'Daily installs' },
					{ value: 'total_installs', text: 'Total installs' },
					{ value: 'ratings', text: 'Ratings' },
					{ value: 'created', text: 'Created date' },
					{ value: 'updated', text: 'Updated date' },
					{ value: 'name', text: 'Name' }
				], cfg.search);
				div.appendChild(createLabel('Search Sort: '));
				div.appendChild(search);
				div.appendChild(createLineBreak());

				let user = createSelect('User Profile Sort', [
					{ value: 'daily-installs', text: 'Daily installs' },
					{ value: 'total_installs', text: 'Total installs' },
					{ value: 'ratings', text: 'Ratings' },
					{ value: 'created', text: 'Created date' },
					{ value: 'updated', text: 'Updated date' },
					{ value: 'name', text: 'Name' }
				], cfg.user);
				div.appendChild(createLabel('User Profile Sort: '));
				div.appendChild(user);
				div.appendChild(createLineBreak());

				div.appendChild(createButton('Save', () => {
					let settings = {
						all: all.value,
						search: search.value,
						user: user.value
					};
					Config.save(settings);
					div.remove();
				}));

				div.appendChild(createButton('Cancel', () => {
					div.remove();
				}));

				document.body.appendChild(div);
			};
			init(Config.load());
		}
	};

	GM_registerMenuCommand('GreasyFork Sort Settings', Config.setup);

	let onScripts = location.href.match(/^https?:\/\/greasyfork\.org\/[^/]+\/scripts\/?(?:\?.*)?$/i);
	let onSearch = location.href.match(/^https?:\/\/greasyfork\.org\/[^/]+\/scripts\/search?(?:\?.*)?$/i);
	let onProfile = location.href.match(/^https?:\/\/greasyfork\.org\/[^/]+\/users\/[^/]+?(?:\?.*)?$/i);

	document.addEventListener('DOMContentLoaded', () => {
		let defaultSort = document.querySelector('#script-list-sort > ul > li:nth-child(1) > a');
		if (defaultSort) {
			if (onSearch) {
				defaultSort.href = Util.setQueryParameter('sort', 'relevance', defaultSort.href);
			} else {
				defaultSort.href = Util.setQueryParameter('sort', 'daily-installs', defaultSort.href);
			}
		}
	});

	let sort = Util.getQueryParameter('sort');
	if (!sort) {
		let cfg = Config.load();
		let cfgSort;
		if (onScripts) {
			cfgSort = cfg.all;
		} else if (onSearch) {
			cfgSort = cfg.search;
		} else if (onProfile) {
			cfgSort = cfg.user;
		}
		if (cfgSort) {
			window.location.replace(Util.setQueryParameter('sort', cfgSort));
		}
	}
})();
