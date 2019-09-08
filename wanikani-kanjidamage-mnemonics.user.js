// ==UserScript==
// @name         WaniKani Kanjidamage Mnemonics
// @namespace    https://greasyfork.org/users/649
// @version      1.1.7
// @description  Includes Kanjidamage Mnemonics in WaniKani
// @author       Adrien Pyke
// @match        *://www.wanikani.com/kanji/*
// @match        *://www.wanikani.com/level/*/kanji/*
// @match        *://www.wanikani.com/review/session
// @match        *://www.wanikani.com/lesson/session
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(() => {
	'use strict';

	const SCRIPT_NAME = 'WaniKani Kanjidamage Mnemonics';
	const cachedKanji = [];

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

						const tempDiv = document.createElement('div');
						tempDiv.innerHTML = response.responseText;

						let reading = '';
						let mnemonic = '';

						const classReplaceCallback = elem => {
							if (elem.classList.contains('onyomi')) {
								elem.classList.remove('onyomi');
								elem.classList.add(
									inLesson ? 'highlight-reading' : 'reading-highlight'
								);
							}
							if (elem.classList.contains('component')) {
								elem.classList.remove('component');
								elem.classList.add(
									inLesson ? 'highlight-radical' : 'radical-highlight'
								);
							}
							if (elem.classList.contains('translation')) {
								elem.classList.remove('translation');
								elem.classList.add(
									inLesson ? 'highlight-kanji' : 'kanji-highlight'
								);
							}
						};

						let onyomiTable = Util.qq('h2', tempDiv).filter(elem =>
							elem.textContent.includes('Onyomi')
						);
						if (onyomiTable.length > 0) {
							onyomiTable = onyomiTable[0].nextElementSibling;
							const readingElem = Util.q('td:nth-child(2)', onyomiTable);
							Util.qq('span', readingElem).forEach(classReplaceCallback);
							reading = readingElem.innerHTML;
						}

						let mnemonicTable = Util.qq('h2', tempDiv).filter(elem =>
							elem.textContent.includes('Mnemonic')
						);
						if (mnemonicTable.length > 0) {
							mnemonicTable = mnemonicTable[0].nextElementSibling;
							const mnemonicElem = Util.q('td:nth-child(2)', mnemonicTable);
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

	const isReview = window.location.pathname.includes('/review/');
	const isLesson = window.location.pathname.includes('/lesson/');

	if (isLesson) {
		waitForElems({
			sel: '#main-info',
			stop: true,
			onmatch() {
				const meaningH2 = document.createElement('h2');
				const meaningLink = document.createElement('a');
				meaningLink.textContent = 'Kanjidamage';
				meaningLink.target = '_blank';
				meaningLink.rel = 'noopener noreferrer';
				meaningH2.appendChild(meaningLink);
				const meaningSection = document.createElement('section');

				Util.appendAfter(Util.q('#supplement-kan-meaning-notes'), meaningH2);
				Util.appendAfter(meaningH2, meaningSection);

				const readingH2 = document.createElement('h2');
				const readingLink = document.createElement('a');
				readingLink.textContent = 'Kanjidamage';
				readingLink.target = '_blank';
				readingLink.rel = 'noopener noreferrer';
				readingH2.appendChild(readingLink);
				const readingSection = document.createElement('section');

				Util.appendAfter(Util.q('#supplement-kan-reading-notes'), readingH2);
				Util.appendAfter(readingH2, readingSection);

				const reviewContainer = document.createElement('section');
				const reviewH2 = document.createElement('h2');
				const reviewLink = document.createElement('a');
				reviewLink.textContent = 'Kanjidamage';
				reviewLink.target = '_blank';
				reviewLink.rel = 'noopener noreferrer';
				reviewH2.appendChild(reviewLink);
				reviewContainer.appendChild(reviewH2);
				const reviewSection = document.createElement('section');
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
					meaningLink.href = '';
					readingLink.href = '';
					reviewLink.href = '';
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

					meaningLink.href = kanjiObj.url;
					readingLink.href = kanjiObj.url;
					reviewLink.href = kanjiObj.url;
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
							const kanji = Util.q('#character').textContent;
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
				const reviewContainer = document.createElement('section');
				const reviewH2 = document.createElement('h2');
				const reviewLink = document.createElement('a');
				reviewLink.textContent = 'Kanjidamage';
				reviewLink.target = '_blank';
				reviewLink.rel = 'noopener noreferrer';
				reviewH2.appendChild(reviewLink);
				reviewContainer.appendChild(reviewH2);
				const reviewSection = document.createElement('section');
				reviewContainer.appendChild(reviewSection);

				const outputKanjidamage = function(kanjiObj) {
					let html = '';
					if (kanjiObj.reading) {
						html += kanjiObj.reading;
					}
					if (kanjiObj.mnemonic) {
						html += kanjiObj.mnemonic;
					}

					reviewLink.href = kanjiObj.url;
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
							const kanji = Util.q('#character > span').textContent;
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
		const kanji = Util.q('.kanji-icon > span:nth-child(1)').textContent;

		App.getKanjiDamageInfo(kanji, false, kanjiObj => {
			const section = document.createElement('section');

			const header = document.createElement('h2');
			header.innerHTML = `<a href="${kanjiObj.url}" target="_blank" rel="noopener noreferrer">Kanjidamage</a>`;
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
