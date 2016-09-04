// ==UserScript==
// @name         WaniKani Kanjidamage Mnemonics
// @namespace    https://greasyfork.org/users/649
// @version      1.0.7
// @description  Includes Kanjidamage Mnemonics in WaniKani
// @author       Adrien Pyke
// @match        *://www.wanikani.com/kanji/*
// @match        *://www.wanikani.com/level/*/kanji/*
// @match        *://www.wanikani.com/review/session
// @match        *://www.wanikani.com/lesson/session
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'WaniKani Kanjidamage Mnemonics';
	var cachedKanji = [];

	var Util = {
		log: function() {
			var args = [].slice.call(arguments);
			args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');
			console.log.apply(console, args);
		},
		q: function(query, context) {
			return (context || document).querySelector(query);
		},
		qq: function(query, context) {
			return [].slice.call((context || document).querySelectorAll(query));
		},
		appendAfter: function(elem, elemToAppend) {
			elem.parentNode.insertBefore(elemToAppend, elem.nextElementSibling);
		}
	};

	var App = {
		getKanjiDamageInfo: function(kanji, inLesson, callback) {
			if (cachedKanji[kanji]) {
				Util.log(kanji + ' cached');
				callback(cachedKanji[kanji]);
			} else {
				Util.log('Loading Kanjidamage information for ' + kanji);

				GM_xmlhttpRequest({
					method: 'GET',
					url: 'http://www.kanjidamage.com/kanji/search?q=' + kanji,
					onload: function(response) {
						Util.log('Found Kanjidamage information for ' + kanji);

						var tempDiv = document.createElement('div');
						tempDiv.innerHTML = response.responseText;

						var reading = '';
						var mnemonic = '';

						var classReplaceCallback = function(elem) {
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

						var onyomiTable = Util.qq('h2', tempDiv).filter(function(elem) {
							return elem.textContent.indexOf('Onyomi') !== -1;
						});
						if (onyomiTable.length > 0) {
							onyomiTable = onyomiTable[0].nextElementSibling;
							var readingElem = Util.q('td:nth-child(2)', onyomiTable);
							Util.qq('span', readingElem).forEach(classReplaceCallback);
							reading = readingElem.innerHTML;
						}

						var mnemonicTable = Util.qq('h2', tempDiv).filter(function(elem) {
							return elem.textContent.indexOf('Mnemonic') !== -1;
						});
						if (mnemonicTable.length > 0) {
							mnemonicTable = mnemonicTable[0].nextElementSibling;
							var mnemonicElem = Util.q('td:nth-child(2)', mnemonicTable);
							Util.qq('span', mnemonicElem).forEach(classReplaceCallback);
							mnemonic = mnemonicElem.innerHTML;
						}

						cachedKanji[kanji] = {
							character: kanji,
							reading: reading,
							mnemonic: mnemonic,
							url: response.finalUrl
						};

						callback(cachedKanji[kanji]);
					},
					onerror: function() {
						Util.log('Could not find Kanjidamage information for ' + kanji);
					}
				});
			}
		}
	};

	var isReview = (window.location.pathname.indexOf("/review/") > -1);
	var isLesson = (window.location.pathname.indexOf("/lesson/") > -1);

	if (isLesson) {
		waitForElems('#main-info', function(character) {
			var meaningH2 = document.createElement('h2');
			var meaningLink = document.createElement('a');
			meaningLink.textContent = 'Kanjidamage';
			meaningLink.setAttribute('target', '_blank');
			meaningH2.appendChild(meaningLink);
			var meaningSection = document.createElement('section');

			Util.appendAfter(Util.q('#supplement-kan-meaning-notes'), meaningH2);
			Util.appendAfter(meaningH2, meaningSection);

			var readingH2 = document.createElement('h2');
			var readingLink = document.createElement('a');
			readingLink.textContent = 'Kanjidamage';
			readingLink.setAttribute('target', '_blank');
			readingH2.appendChild(readingLink);
			var readingSection = document.createElement('section');

			Util.appendAfter(Util.q('#supplement-kan-reading-notes'), readingH2);
			Util.appendAfter(readingH2, readingSection);

			var reviewContainer = document.createElement('section');
			var reviewH2 = document.createElement('h2');
			var reviewLink = document.createElement('a');
			reviewLink.textContent = 'Kanjidamage';
			reviewLink.setAttribute('target', '_blank');
			reviewH2.appendChild(reviewLink);
			reviewContainer.appendChild(reviewH2);
			var reviewSection = document.createElement('section');
			reviewContainer.appendChild(reviewSection);

			waitForElems('#note-reading', function(elem) {
				if (Util.q('#main-info').classList.contains('kanji')) {
					Util.appendAfter(elem, reviewContainer);
				}
			});

			var clearOutput = function() {
				meaningLink.setAttribute('href', '');
				readingLink.setAttribute('href', '');
				reviewLink.setAttribute('href', '');
				meaningSection.innerHTML = '';
				readingSection.innerHTML = '';
				reviewSection.innerHTML = '';
			};

			var outputKanjidamage = function(kanjiObj) {
				var html = '';
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

			var observer = new MutationObserver(function(mutations) {
				clearOutput();
				if (Util.q('#main-info').classList.contains('kanji')) {
					var kanji = Util.q('#character').textContent;
					App.getKanjiDamageInfo(kanji, true, function(kanjiObj) {
						if (kanji === kanjiObj.character) {
							outputKanjidamage(kanjiObj);
						}
					});
				}
			});
			observer.observe(Util.q('#main-info'), { attributes:true, childList: true, characterData: true });
		}, true);
	} else if (isReview) {
		waitForElems('#character', function(character) {
			var reviewContainer = document.createElement('section');
			var reviewH2 = document.createElement('h2');
			var reviewLink = document.createElement('a');
			reviewLink.textContent = 'Kanjidamage';
			reviewLink.setAttribute('target', '_blank');
			reviewH2.appendChild(reviewLink);
			reviewContainer.appendChild(reviewH2);
			var reviewSection = document.createElement('section');
			reviewContainer.appendChild(reviewSection);

			var outputKanjidamage = function(kanjiObj) {
				var html = '';
				if (kanjiObj.reading) {
					html += kanjiObj.reading;
				}
				if (kanjiObj.mnemonic) {
					html += kanjiObj.mnemonic;
				}

				reviewLink.setAttribute('href', kanjiObj.url);
				reviewSection.innerHTML = html;
			};

			waitForElems('#note-reading', function(elem) {
				if (Util.q('#character').classList.contains('kanji')) {
					Util.appendAfter(elem, reviewContainer);
				}
			});

			var observer = new MutationObserver(function(mutations) {
				if (Util.q('#character').classList.contains('kanji')) {
					var kanji = Util.q('#character > span').textContent;
					App.getKanjiDamageInfo(kanji, true, function(kanjiObj) {
						if (kanji === kanjiObj.character) {
							outputKanjidamage(kanjiObj);
						}
					});
				}
			});
			observer.observe(Util.q('#character'), { attributes:true, childList: true, characterData: true });
		});
	} else {
		var kanji = Util.q('.kanji-icon > span:nth-child(1)').textContent;

		App.getKanjiDamageInfo(kanji, false, function(kanjiObj) {
			var section = document.createElement('section');

			var header = document.createElement('h2');
			header.innerHTML = '<a href="' + kanjiObj.url + '" target="_blank">Kanjidamage</a>';
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
