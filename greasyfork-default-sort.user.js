// ==UserScript==
// @name         Greasy Fork - Change Default Script Sort
// @namespace    https://greasyfork.org/users/649
// @version      1.3.2
// @description  Change default script sort on GreasyFork
// @author       Adrien Pyke
// @match        *://greasyfork.org/*/users/*
// @match        *://greasyfork.org/*/scripts*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
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
			values: [
				{ value: 'relevance', text: 'Relevance' },
				...commonValues
			]
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

	waitForElems({
		sel: '#script-list-sort > ul > li:first-of-type > a',
		stop: true,
		onmatch(defaultSort) {
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
