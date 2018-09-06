// ==UserScript==
// @name         Greasy Fork - Change Default Script Sort
// @namespace    https://greasyfork.org/users/649
// @version      1.3
// @description  Change default script sort on GreasyFork
// @author       Adrien Pyke
// @match        *://greasyfork.org/*/users/*
// @match        *://greasyfork.org/*/scripts*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// @run-at       document-start
// ==/UserScript==

(() => {
	'use strict';

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
		}, {
			key: 'search',
			label: 'Search Sort',
			default: 'relevance',
			type: 'dropdown',
			values: [{ value: 'relevance', text: 'Relevance' }].concat(commonValues)
		}, {
			key: 'user',
			label: 'User Profile Sort',
			default: 'daily-installs',
			type: 'dropdown',
			values: commonValues
		}
	]);
	GM_registerMenuCommand('GreasyFork Sort Settings', Config.setup);

	const onSearch = location.href.match(/^https?:\/\/greasyfork\.org\/.+?\/scripts\/?.*\?.*q=/i);
	const onScripts = location.href.match(/^https?:\/\/greasyfork\.org\/.+?\/scripts\/?/i);
	const onProfile = location.href.match(/^https?:\/\/greasyfork\.org\/.+?\/users\//i);

	document.addEventListener('DOMContentLoaded', () => {
		const defaultSort = document.querySelector('#script-list-sort > ul > li:nth-child(1) > a');
		if (defaultSort) {
			const url = new URL(defaultSort.href);
			url.searchParams.set('sort', onSearch ? 'relevance' : 'daily-installs');
			defaultSort.href = url.href;
		}
	});

	const url = new URL(location.href);
	const sort = url.searchParams.get('sort');
	if (!sort) {
		const cfg = Config.load();
		let cfgSort;
		if (onSearch) {
			cfgSort = cfg.search;
		} else if (onScripts) {
			cfgSort = cfg.all;
		} else if (onProfile) {
			cfgSort = cfg.user;
		}
		if (cfgSort) {
			url.searchParams.set('sort', cfgSort);
			window.location.replace(url.href);
		}
	}
})();
