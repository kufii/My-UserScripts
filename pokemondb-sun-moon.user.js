// ==UserScript==
// @name         Auto Select Sun/Moon on PokemonDB
// @namespace    https://greasyfork.org/users/649
// @version      1.0.2
// @description  Auto selects Sun/Moon in the Moves section on PokemonDB
// @author       Adrien Pyke
// @match        http://pokemondb.net/pokedex/*
// @grant        none
// ==/UserScript==

(() => {
	'use strict';

	const [tab] = Array.from(document.querySelectorAll('.svtabs-tab > a')).filter(tab => tab.textContent === 'Sun/Moon');
	if (tab) {
		tab.click();
	}
})();
