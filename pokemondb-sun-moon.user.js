// ==UserScript==
// @name         Auto Select Sun/Moon on PokemonDB
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Auto selects Sun/Moon in the Moves section on PokemonDB
// @author       Adrien Pyke
// @match        http://pokemondb.net/pokedex/*
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	var tab = [].filter.call(document.querySelectorAll('.svtabs-tab > a'), function(tab) {
		return tab.textContent === 'Sun/Moon';
	});
	if (tab.length > 0) {
		tab[0].click();
	}
})();
