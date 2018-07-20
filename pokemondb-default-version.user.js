// ==UserScript==
// @name         PokemonDB Default Version
// @namespace    https://greasyfork.org/users/649
// @version      2.0
// @description  Auto selects the chosen version in the Moves section on PokemonDB
// @author       Adrien Pyke
// @match        *://pokemondb.net/pokedex/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// ==/UserScript==

(() => {
	'use strict';

	const Config = GM_config([
		{
			key: 1,
			label: 'Gen 1',
			type: 'dropdown',
			showBlank: true,
			values: ['Red/Blue', 'Yellow']
		}, {
			key: 2,
			label: 'Gen 2',
			type: 'dropdown',
			showBlank: true,
			values: ['Gold/Silver', 'Crystal']
		}, {
			key: 3,
			label: 'Gen 3',
			type: 'dropdown',
			showBlank: true,
			values: ['Ruby/Sapphire', 'FireRed/LeafGreen', 'Emerald']
		}, {
			key: 4,
			label: 'Gen 4',
			type: 'dropdown',
			showBlank: true,
			values: ['Diamond/Pearl', 'Platinum', 'HeartGold/SoulSilver']
		}, {
			key: 5,
			label: 'Gen 5',
			type: 'dropdown',
			showBlank: true,
			values: ['Black/White', 'Black 2/White 2']
		}, {
			key: 6,
			label: 'Gen 6',
			type: 'dropdown',
			showBlank: true,
			values: ['X/Y', 'Omega Ruby/Alpha Sapphire']
		}, {
			key: 7,
			label: 'Gen 7',
			type: 'dropdown',
			showBlank: true,
			values: ['Ultra Sun/Ultra Moon', 'Sun/Moon']
		}
	]);
	GM_registerMenuCommand('Select default PokemonDB versions', Config.setup);

	const match = location.href.match(/^https?:\/\/pokemondb\.net\/pokedex\/.*?\/moves\/(\d+)/i);
	const currentGen = match ? match[1] : 7;
	const defaultVersion = Config.load()[currentGen];

	if (defaultVersion) {
		const [tab] = Array.from(document.querySelectorAll('.tabs-tab-list > a.tabs-tab')).filter(tab => tab.textContent === defaultVersion);
		if (tab) {
			tab.click();
		}
	}
})();
