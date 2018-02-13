// ==UserScript==
// @name         Telegram Web Emojione
// @namespace    https://greasyfork.org/users/649
// @version      1.0.29
// @description  Replaces old iOS emojis with Emojione on Telegram Web
// @author       Adrien Pyke
// @match        *://web.telegram.org/*
// @grant        none
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=250853
// @require      https://greasyfork.org/scripts/38329-emojione-min-js/code/emojioneminjs.js?version=250047
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'Telegram Web Emojione';

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
		appendStyle: function(str) {
			var style = document.createElement('style');
			style.textContent = str;
			document.head.appendChild(style);
		},
		regexEscape: function(str) {
			return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		}
	};

	var sizes = [
		{
			size: 20
		}, {
			class: ['im_short_message_text', 'im_short_message_media'],
			size: 16
		}, {
			class: ['composer_emoji_tooltip', 'stickerset_modal_sticker_alt'],
			size: 26
		}
	];

	Util.appendStyle(sizes.map(function(size) {
		var output = '.emojione';
		if (size.class) {
			output = size.class.map(function(c) {
				return '.' + c + ' .emojione';
			}).join(', ');
		}
		return output + ' {width: ' + size.size + 'px;}';
	}).join(''));

	var replacements = {
		':+1:': ':thumbsup:',
		':facepunch:': ':punch:',
		':hand:': ':raised_hand:',
		':moon:': ':waxing_gibbous_moon:',
		':phone:': ':telephone:',
		':hocho:': ':knife:',
		':boat:': ':sailboat:',
		':car:': ':red_car:',
		':large_blue_circle:': ':blue_circle:',
		'\uD83C\uDFF3': '\uD83C\uDFF3\uFE0F',
		'\uFE0F\uFE0F': '\uFE0F'
	};

	var makeReplacements = function(str) {
		for (var property in replacements) {
			if (replacements.hasOwnProperty(property)) {
				str = str.replace(new RegExp(Util.regexEscape(property), 'g'), replacements[property]);
			}
		}
		return str;
	};

	var getImageSrc = function(shortname) {
		var tempDiv = document.createElement('div');
		tempDiv.innerHTML = emojione.toImage(replacements[shortname] || shortname);
		return Util.q('img', tempDiv).src;
	};

	var convert = function(msg) {
		Util.qq('.emoji', msg).forEach(function(emoji) {
			emoji.outerHTML = emoji.textContent;
		});
		Array.from(msg.childNodes).forEach(function(node) {
			var content = node.textContent;
			if (content) {
				content = makeReplacements(content);

				var withEmoji = emojione.toImage(emojione.shortnameToUnicode(content));
				if (node.nodeType === Node.TEXT_NODE) {
					var tempDiv = document.createElement('div');
					tempDiv.innerHTML = withEmoji;
					if (Util.q('img', tempDiv)) {
						tempDiv.childNodes.forEach(function(child) {
							msg.insertBefore(child.cloneNode(), node);
						});
						node.remove();
					}
				} else {
					node.innerHTML = withEmoji;
				}
			}
		});
	};

	waitForElems({
		sel: [
			'.im_message_text',
			'.im_message_author',
			'.im_message_webpage_site',
			'.im_message_webpage_title > a',
			'.im_message_webpage_description',
			'.im_dialog_peer > span',
			'.stickerset_modal_sticker_alt',
			'.im_message_photo_caption',
			'.im_message_document_caption'
		].join(','),
		onmatch: function(msg) {
			convert(msg);
			var changes = waitForElems({
				context: msg,
				onchange: function() {
					changes.stop();
					convert(msg);
				}
			});
			setTimeout(function() {
				changes.stop();
			}, 1000); // if no changes after 1 second, assume no changes
		}
	});

	waitForElems({
		sel: [
			'.im_short_message_text',
			'.im_short_message_media > span > span > span'
		].join(','),
		onmatch: function(msg) {
			convert(msg);
			var changes = waitForElems({
				context: msg,
				onchange: function() {
					changes.stop();
					convert(msg);
					changes.resume();
				}
			});
		}
	});

	waitForElems({
		sel: '.composer_emoji_btn',
		onmatch: function(btn) {
			btn.innerHTML = emojione.toImage(replacements[btn.title] || btn.title);
		}
	});

	waitForElems({
		sel: '.composer_emoji_option',
		onmatch: function(option) {
			var emoji = Util.q('span', option).textContent;
			emoji = replacements[emoji] || emoji;
			Util.q('.emoji', option).outerHTML = emojione.toImage(emoji);
		}
	});

	var textarea = Util.q('.composer_rich_textarea');
	var textChanges = waitForElems({
		context: textarea,
		config: {
			characterData: true,
			childList: true,
			subtree: true
		},
		onchange: function() {
			textChanges.stop();

			var convertNodes = function(node) {
				if (node.nodeType === Node.TEXT_NODE) {
					var tempDiv = document.createElement('div');
					tempDiv.innerHTML = emojione.toImage(makeReplacements(node.textContent));
					if (Util.q('img', tempDiv)) {
						Util.qq('img', tempDiv).forEach(function(emoji) {
							emoji.removeAttribute('class');
							emoji.classList.add('emoji', 'emoji-w20', 'emoji-spritesheet-0', 'e1-converted');
							emoji.style.backgroundImage = 'url(' + emoji.src + ')';
							emoji.style.backgroundSize = 'cover';
							emoji.src = 'img/blank.gif';
						});
						Array.from(tempDiv.childNodes).forEach(function(tempChild) {
							node.parentNode.insertBefore(tempChild, node);
						});
						node.remove();
					}
				} else if (node.tagName === 'IMG') {
					if (!node.classList.contains('e1-converted')) {
						node.removeAttribute('style');
						node.classList.add('e1-converted');
						node.style.backgroundImage = 'url(' + getImageSrc(node.alt) + ')';
						node.style.backgroundSize = 'cover';
					}
				} else {
					if (node.childNodes) {
						Array.from(node.childNodes).forEach(convertNodes);
					}
				}
			};
			Array.from(textarea.childNodes).forEach(convertNodes);

			textChanges.resume();
		}
	});
})();
