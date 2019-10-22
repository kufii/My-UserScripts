// ==UserScript==
// @name         WaniKani Kanjidamage Mnemonics
// @namespace    https://greasyfork.org/users/649
// @version      2.0.1
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

	const Util = {
		log(...args) {
			args.unshift(`%c${SCRIPT_NAME}:`, 'font-weight: bold;color: #233c7b;');
			console.log(...args);
		},
		fromEntries:
			Object.fromEntries ||
			(iterable => [...iterable].reduce((obj, [key, val]) => ((obj[key] = val), obj), {})),
		q: (query, context = document) => context.querySelector(query),
		qq: (query, context = document) => Array.from(context.querySelectorAll(query)),
		appendAfter: (elem, elemToAppend) =>
			elem.parentNode.insertBefore(elemToAppend, elem.nextElementSibling),
		makeElem: (type, { classes, ...opts } = {}) => {
			const node = Object.assign(
				document.createElement(type),
				Util.fromEntries(Object.entries(opts).filter(([_, value]) => value != null))
			);
			classes && classes.forEach(c => node.classList.add(c));
			return node;
		},
		fetch: (url, method = 'GET') =>
			new Promise((resolve, reject) => {
				GM_xmlhttpRequest({
					url,
					method,
					onload: resolve,
					onerror: reject
				});
			}),
		newTabLink: { target: '_blank', rel: 'noopener noreferrer' }
	};

	const App = {
		cachedKanji: [],
		kanjiDamageLinkProps: {
			textContent: 'Kanjidamage',
			...Util.newTabLink
		},
		getKanjiDamageInfo: async (kanji, inLesson) => {
			if (App.cachedKanji[kanji]) {
				Util.log(`${kanji} cached`);
				return App.cachedKanji[kanji];
			} else {
				Util.log(`Loading Kanjidamage information for ${kanji}`);

				try {
					const response = await Util.fetch(
						`http://www.kanjidamage.com/kanji/search?q=${kanji}`
					);

					Util.log(`Found Kanjidamage information for ${kanji}`);

					const tempDiv = Util.makeElem('div', {
						innerHTML: response.responseText
					});

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
							elem.classList.add(inLesson ? 'highlight-kanji' : 'kanji-highlight');
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

					App.cachedKanji[kanji] = {
						character: kanji,
						reading,
						mnemonic,
						url: response.finalUrl
					};

					return App.cachedKanji[kanji];
				} catch (e) {
					Util.log(`Could not find Kanjidamage information for ${kanji}`);
				}
			}
		},
		createH2() {
			const h2 = Util.makeElem('h2');
			const link = Util.makeElem('a', App.kanjiDamageLinkProps);
			h2.appendChild(link);
			return { h2, link };
		},
		createSection(node) {
			const { h2, link } = App.createH2();
			const section = Util.makeElem('section');
			if (node) {
				Util.appendAfter(node, h2);
				Util.appendAfter(h2, section);
			}
			return { h2, link, section };
		},
		createReviewContainer(sel) {
			const container = Util.makeElem('section');
			const { h2, link, section } = App.createSection();
			container.appendChild(h2);
			container.appendChild(section);
			if (sel)
				waitForElems({
					sel: '#note-reading',
					onmatch(elem) {
						if (Util.q(sel).classList.contains('kanji')) {
							Util.appendAfter(elem, container);
						}
					}
				});
			return { container, h2, link, section };
		},
		getKanjiObjHtml(kanjiObj) {
			let html = '';
			if (kanjiObj.reading) {
				html += kanjiObj.reading;
			}
			if (kanjiObj.mnemonic) {
				html += kanjiObj.mnemonic;
			}
			return html;
		},
		initWatch: (sel, selKanji, cb, cbClear) =>
			waitForElems({
				context: Util.q(sel),
				config: {
					attributes: true,
					childList: true,
					characterData: true
				},
				onchange: async () => {
					cbClear && cbClear();
					if (Util.q(sel).classList.contains('kanji')) {
						const kanji = Util.q(selKanji).textContent.trim();
						const kanjiObj = await App.getKanjiDamageInfo(kanji, true);
						if (kanji === kanjiObj.character) {
							cb && cb(kanjiObj);
						}
					}
				}
			}),
		runOnLesson: () =>
			waitForElems({
				sel: '#main-info',
				stop: true,
				onmatch() {
					const { link: meaningLink, section: meaningSection } = App.createSection(
						Util.q('#supplement-kan-meaning-notes')
					);
					const { link: readingLink, section: readingSection } = App.createSection(
						Util.q('#supplement-kan-reading-notes')
					);
					const { link: reviewLink, section: reviewSection } = App.createReviewContainer(
						'#main-info'
					);

					const clearOutput = () =>
						(meaningLink.href = readingLink.href = reviewLink.href = meaningSection.innerHTML = readingSection.innerHTML = reviewSection.innerHTML =
							'');

					const outputKanjidamage = kanjiObj => {
						meaningLink.href = readingLink.href = reviewLink.href = kanjiObj.url;
						meaningSection.innerHTML = readingSection.innerHTML = reviewSection.innerHTML = App.getKanjiObjHtml(
							kanjiObj
						);
					};

					App.initWatch('#main-info', '#character', outputKanjidamage, clearOutput);
				}
			}),
		runOnReview: () =>
			waitForElems({
				sel: '#character',
				onmatch() {
					const { link, section } = App.createReviewContainer('#character');

					const outputKanjidamage = kanjiObj => {
						link.href = kanjiObj.url;
						section.innerHTML = App.getKanjiObjHtml(kanjiObj);
					};

					App.initWatch('#character', '#character > span', outputKanjidamage);
				}
			}),
		runOnKanjiPage: async () => {
			const kanji = Util.q('.kanji-icon').textContent;
			const kanjiObj = await App.getKanjiDamageInfo(kanji, false);
			const { container, link, section } = App.createReviewContainer();

			link.href = kanjiObj.url;
			if (kanjiObj.reading) {
				section.innerHTML += kanjiObj.reading;
			}
			if (kanjiObj.mnemonic) {
				section.innerHTML += kanjiObj.mnemonic;
			}

			Util.appendAfter(Util.q('#note-reading').parentNode, container);
		}
	};

	const isLesson = window.location.pathname.includes('/lesson/');
	const isReview = window.location.pathname.includes('/review/');

	isLesson ? App.runOnLesson() : isReview ? App.runOnReview() : App.runOnKanjiPage();
})();
