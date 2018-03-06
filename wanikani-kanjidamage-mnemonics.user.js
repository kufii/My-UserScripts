// ==UserScript==
// @name         WaniKani Kanjidamage Mnemonics
// @namespace    https://greasyfork.org/users/649
// @version      1.1.1
// @description  Includes Kanjidamage Mnemonics in WaniKani
// @author       Adrien Pyke
// @match        *://www.wanikani.com/kanji/*
// @match        *://www.wanikani.com/level/*/kanji/*
// @match        *://www.wanikani.com/review/session
// @match        *://www.wanikani.com/lesson/session
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(() => {
	'use strict';

	const SCRIPT_NAME = 'WaniKani Kanjidamage Mnemonics';
	let cachedKanji = [];

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
		},
		appendAfter(elem, elemToAppend) {
			elem.parentNode.insertBefore(elemToAppend, elem.nextElementSibling);
		}
	};

	const App = {
		getKanjiDamageInfo(kanji, inLesson, callback) {
			if (cachedKanji[kanji]) {
				Util.log(`${kanji} cached`);
				callback(cachedKanji[kanji]);
			} else {
				Util.log(`Loading Kanjidamage information for ${kanji}`);

				GM_xmlhttpRequest({
					method: 'GET',
					url: `http://www.kanjidamage.com/kanji/search?q=${kanji}`,
					onload(response) {
						Util.log(`Found Kanjidamage information for ${kanji}`);

						let tempDiv = document.createElement('div');
						tempDiv.innerHTML = response.responseText;

						let reading = '';
						let mnemonic = '';

						let classReplaceCallback = elem => {
							if (elem.classList.contains('onyomi')) {
								elem.classList.remove('onyomi');
								elem.classList.add(inLesson ? 'highlight-reading' : 'reading-highlight');
							}
							if (elem.classList.contains('component')) {
								elem.classList.remove('component');
								elem.classList.add(inLesson ? 'highlight-radical' : 'radical-highlight');
							}
							if (elem.classList.contains('translation')) {
								elem.classList.remove('translation');
								elem.classList.add(inLesson ? 'highlight-kanji' : 'kanji-highlight');
							}
						};

						let onyomiTable = Util.qq('h2', tempDiv).filter(elem => {
							return elem.textContent.indexOf('Onyomi') !== -1;
						});
						if (onyomiTable.length > 0) {
							onyomiTable = onyomiTable[0].nextElementSibling;
							let readingElem = Util.q('td:nth-child(2)', onyomiTable);
							Util.qq('span', readingElem).forEach(classReplaceCallback);
							reading = readingElem.innerHTML;
						}

						let mnemonicTable = Util.qq('h2', tempDiv).filter(elem => {
							return elem.textContent.indexOf('Mnemonic') !== -1;
						});
						if (mnemonicTable.length > 0) {
							mnemonicTable = mnemonicTable[0].nextElementSibling;
							let mnemonicElem = Util.q('td:nth-child(2)', mnemonicTable);
							Util.qq('span', mnemonicElem).forEach(classReplaceCallback);
							mnemonic = mnemonicElem.innerHTML;
						}

						cachedKanji[kanji] = {
							character: kanji,
							reading,
							mnemonic,
							url: response.finalUrl
						};

						callback(cachedKanji[kanji]);
					},
					onerror() {
						Util.log(`Could not find Kanjidamage information for ${kanji}`);
					}
				});
			}
		}
	};

	let isReview = (window.location.pathname.indexOf('/review/') > -1);
	let isLesson = (window.location.pathname.indexOf('/lesson/') > -1);

	if (isLesson) {
		waitForElems({
			sel: '#main-info',
			stop: true,
			onmatch() {
				let meaningH2 = document.createElement('h2');
				let meaningLink = document.createElement('a');
				meaningLink.textContent = 'Kanjidamage';
				meaningLink.setAttribute('target', '_blank');
				meaningH2.appendChild(meaningLink);
				let meaningSection = document.createElement('section');

				Util.appendAfter(Util.q('#supplement-kan-meaning-notes'), meaningH2);
				Util.appendAfter(meaningH2, meaningSection);

				let readingH2 = document.createElement('h2');
				let readingLink = document.createElement('a');
				readingLink.textContent = 'Kanjidamage';
				readingLink.setAttribute('target', '_blank');
				readingH2.appendChild(readingLink);
				let readingSection = document.createElement('section');

				Util.appendAfter(Util.q('#supplement-kan-reading-notes'), readingH2);
				Util.appendAfter(readingH2, readingSection);

				let reviewContainer = document.createElement('section');
				let reviewH2 = document.createElement('h2');
				let reviewLink = document.createElement('a');
				reviewLink.textContent = 'Kanjidamage';
				reviewLink.setAttribute('target', '_blank');
				reviewH2.appendChild(reviewLink);
				reviewContainer.appendChild(reviewH2);
				let reviewSection = document.createElement('section');
				reviewContainer.appendChild(reviewSection);

				waitForElems({
					sel: '#note-reading',
					onmatch(elem) {
						if (Util.q('#main-info').classList.contains('kanji')) {
							Util.appendAfter(elem, reviewContainer);
						}
					}
				});

				const clearOutput = function() {
					meaningLink.setAttribute('href', '');
					readingLink.setAttribute('href', '');
					reviewLink.setAttribute('href', '');
					meaningSection.innerHTML = '';
					readingSection.innerHTML = '';
					reviewSection.innerHTML = '';
				};

				const outputKanjidamage = function(kanjiObj) {
					let html = '';
					if (kanjiObj.reading) {
						html += kanjiObj.reading;
					}
					if (kanjiObj.mnemonic) {
						html += kanjiObj.mnemonic;
					}

					meaningLink.setAttribute('href', kanjiObj.url);
					readingLink.setAttribute('href', kanjiObj.url);
					reviewLink.setAttribute('href', kanjiObj.url);
					meaningSection.innerHTML = html;
					readingSection.innerHTML = html;
					reviewSection.innerHTML = html;
				};

				waitForElems({
					context: Util.q('#main-info'),
					config: {
						attributes: true,
						childList: true,
						characterData: true
					},
					onchange() {
						clearOutput();
						if (Util.q('#main-info').classList.contains('kanji')) {
							let kanji = Util.q('#character').textContent;
							App.getKanjiDamageInfo(kanji, true, kanjiObj => {
								if (kanji === kanjiObj.character) {
									outputKanjidamage(kanjiObj);
								}
							});
						}
					}
				});
			}
		});
	} else if (isReview) {
		waitForElems({
			sel: '#character',
			onmatch() {
				let reviewContainer = document.createElement('section');
				let reviewH2 = document.createElement('h2');
				let reviewLink = document.createElement('a');
				reviewLink.textContent = 'Kanjidamage';
				reviewLink.setAttribute('target', '_blank');
				reviewH2.appendChild(reviewLink);
				reviewContainer.appendChild(reviewH2);
				let reviewSection = document.createElement('section');
				reviewContainer.appendChild(reviewSection);

				let outputKanjidamage = function(kanjiObj) {
					let html = '';
					if (kanjiObj.reading) {
						html += kanjiObj.reading;
					}
					if (kanjiObj.mnemonic) {
						html += kanjiObj.mnemonic;
					}

					reviewLink.setAttribute('href', kanjiObj.url);
					reviewSection.innerHTML = html;
				};

				waitForElems({
					sel: '#note-reading',
					onmatch(elem) {
						if (Util.q('#character').classList.contains('kanji')) {
							Util.appendAfter(elem, reviewContainer);
						}
					}
				});

				waitForElems({
					context: Util.q('#character'),
					config: {
						attributes: true,
						childList: true,
						characterData: true
					},
					onchange() {
						if (Util.q('#character').classList.contains('kanji')) {
							let kanji = Util.q('#character > span').textContent;
							App.getKanjiDamageInfo(kanji, true, kanjiObj => {
								if (kanji === kanjiObj.character) {
									outputKanjidamage(kanjiObj);
								}
							});
						}
					}
				});
			}
		});
	} else {
		let kanji = Util.q('.kanji-icon > span:nth-child(1)').textContent;

		App.getKanjiDamageInfo(kanji, false, kanjiObj => {
			let section = document.createElement('section');

			let header = document.createElement('h2');
			header.innerHTML = `<a href="${kanjiObj.url}" target="_blank">Kanjidamage</a>`;
			section.appendChild(header);

			if (kanjiObj.reading) {
				section.innerHTML += kanjiObj.reading;
			}
			if (kanjiObj.mnemonic) {
				section.innerHTML += kanjiObj.mnemonic;
			}

			Util.appendAfter(Util.q('#note-reading').parentNode, section);
		});
	}
})();
