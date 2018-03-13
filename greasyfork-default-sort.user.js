// ==UserScript==
// @name         Greasy Fork - Change Default Script Sort
// @namespace    https://greasyfork.org/users/649
// @version      1.2.3
// @description  Change default script sort on GreasyFork
// @author       Adrien Pyke
// @match        *://greasyfork.org/*/users/*
// @match        *://greasyfork.org/*/scripts*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/ade78c40d34a8abccfe94906d85938b8f07b3c76/libs/gm_config.js
// @run-at       document-start
// ==/UserScript==

(() => {
	'use strict';

	const Util = {
		q(query, context = document) {
			return context.querySelector(query);
		},
		getQueryParameter(name, url = window.location.href) {
			name = name.replace(/[[\]]/g, '\\$&');
			let regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		},
		setQueryParameter(key, value, url = window.location.href) {
			let re = new RegExp(`([?&])${key}=.*?(&|#|$)(.*)`, 'gi'),
				hash;

			if (re.test(url)) {
				if (typeof value !== 'undefined' && value !== null) return url.replace(re, `$1${key}=${value}$2$3`);
				else {
					hash = url.split('#');
					url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
					if (typeof hash[1] !== 'undefined' && hash[1] !== null) url += `#${hash[1]}`;
					return url;
				}
			} else if (typeof value !== 'undefined' && value !== null) {
				let separator = url.indexOf('?') !== -1 ? '&' : '?';
				hash = url.split('#');
				url = `${hash[0] + separator + key}=${value}`;
				if (typeof hash[1] !== 'undefined' && hash[1] !== null) url += `#${hash[1]}`;
				return url;
			} else return url;
		}
	};

	const commonValues = [
		{ value: 'daily-installs', text: 'Daily installs' },
		{ value: 'total_installs', text: 'Total installs' },
		{ value: 'ratings', text: 'Ratings' },
		{ value: 'created', text: 'Created date' },
		{ value: 'updated', text: 'Updated date' },
		{ value: 'name', text: 'Name' }
	];
	const Config = GM_config([
		{
			key: 'all',
			label: 'All Scripts Sort',
			default: 'daily-installs',
			type: 'dropdown',
			values: commonValues
		},
		{
			key: 'search',
			label: 'Search Sort',
			default: 'relevance',
			type: 'dropdown',
			values: [{ value: 'relevance', text: 'Relevance' }].concat(commonValues)
		},
		{
			key: 'user',
			label: 'User Profile Sort',
			default: 'daily-installs',
			type: 'dropdown',
			values: commonValues
		}
	]);
	GM_registerMenuCommand('GreasyFork Sort Settings', Config.setup);

	let onScripts = location.href.match(/^https?:\/\/greasyfork\.org\/[^/]+\/scripts\/?(?:\?.*)?$/i);
	let onSearch = location.href.match(/^https?:\/\/greasyfork\.org\/[^/]+\/scripts\/search?(?:\?.*)?$/i);
	let onProfile = location.href.match(/^https?:\/\/greasyfork\.org\/[^/]+\/users\/[^/]+?(?:\?.*)?$/i);

	document.addEventListener('DOMContentLoaded', () => {
		let defaultSort = Util.q('#script-list-sort > ul > li:nth-child(1) > a');
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
