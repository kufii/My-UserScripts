// ==UserScript==
// @name         D&D Beyond, Jumping Speed
// @namespace    https://greasyfork.org/users/649
// @version      1.0.3
// @description  Adds a jumping speed section to D&D Beyond
// @author       Adrien Pyke
// @match        *://www.dndbeyond.com/profile/*/characters/*
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
	'use strict';

	const SCRIPT_NAME = 'D&D Beyond, Jumping Speed';

	const Util = {
		log(...args) {
			args.unshift(`%c${SCRIPT_NAME}:`, 'font-weight: bold;color: #233c7b;');
			console.log(...args);
		},
		q(query, context = document) {
			return context.querySelector(query);
		},
		qq(query, context = document) {
			return Array.from(context.querySelectorAll(query));
		}
	};

	const Character = {
		id: parseInt(location.pathname.match(/\/([0-9]+)$/)[1]),
		get strength() {
			return parseInt(Util.q('.character-ability-strength > .character-ability-score').textContent);
		},
		get strengthModifier() {
			return parseInt(Util.q('.character-ability-strength > .character-ability-modifier > .character-ability-stat-value').textContent);
		},
		get longJump() {
			return parseInt(GM_getValue(`${Character.id}-long-jump`) || Character.strength);
		},
		get highJump() {
			return parseInt(GM_getValue(`${Character.id}-high-jump`) || Character.strengthModifier + 3);
		}
	};

	const App = {
		createSpeedManagerItem(label, amount) {
			let div = document.createElement('div');
			div.classList.add('speed-manager-item');

			let lblSpan = document.createElement('span');
			lblSpan.classList.add('speed-manager-item-label');
			lblSpan.textContent = label;
			div.appendChild(lblSpan);

			let lblAmount = document.createElement('span');
			lblAmount.classList.add('speed-manager-item-amount');
			lblAmount.textContent = `${amount} ft.`;
			div.appendChild(lblAmount);

			return div;
		},
		createOverrideItem(label, key) {
			let div = document.createElement('div');
			div.classList.add('speed-manager-override-item');
			div.dataset.key = key;

			let lblDiv = document.createElement('div');
			lblDiv.classList.add('speed-manager-override-item-label');
			lblDiv.textContent = label;
			div.appendChild(lblDiv);

			let inputDiv = document.createElement('div');
			inputDiv.classList.add('speed-manager-override-item-input');

			let value = document.createElement('input');
			value.setAttribute('type', 'number');
			value.setAttribute('min', 0);
			value.setAttribute('value', GM_getValue(`${Character.id}-${key}`) || '');
			inputDiv.appendChild(value);

			div.appendChild(inputDiv);

			let sourceDiv = document.createElement('div');
			sourceDiv.classList.add('speed-manager-override-item-source');

			let source = document.createElement('input');
			source.setAttribute('type', 'text');
			source.setAttribute('value', GM_getValue(`${Character.id}-${key}-source`) || '');
			sourceDiv.appendChild(source);

			div.appendChild(sourceDiv);

			return div;
		},
		saveOverrideItem(item, key) {
			if (item) {
				let value = Util.q('.speed-manager-override-item-input > input', item).value;
				let source = Util.q('.speed-manager-override-item-source > input', item).value;
				GM_setValue(`${Character.id}-${key}`, value);
				GM_setValue(`${Character.id}-${key}-source`, source);
			}
		}
	};

	waitForElems({
		sel: '.speed-manager-view',
		onmatch(view) {
			const items = Util.q('.speed-manager-items', view);
			items.appendChild(App.createSpeedManagerItem('Long Jump', Character.longJump));
			items.appendChild(App.createSpeedManagerItem('High Jump', Character.highJump));

			Util.q('.fullscreen-modal-accept > button').addEventListener('click', () => {
				App.saveOverrideItem(Util.q('[data-key="long-jump"]'), 'long-jump');
				App.saveOverrideItem(Util.q('[data-key="high-jump"]'), 'high-jump');
			});
		}
	});

	waitForElems({
		sel: '.speed-manager-override-list',
		onmatch(overrides) {
			const longJumpOverride = App.createOverrideItem('Long Jump', 'long-jump');
			const highJumpOverride = App.createOverrideItem('High Jump', 'high-jump');
			overrides.appendChild(longJumpOverride);
			overrides.appendChild(highJumpOverride);
		}
	});
})();
