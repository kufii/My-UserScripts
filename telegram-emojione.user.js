// ==UserScript==
// @name         Telegram Web Emojione
// @namespace    https://greasyfork.org/users/649
// @version      1.0.19
// @description  Replaces old iOS emojis with Emojione on Telegram Web
// @author       Adrien Pyke
// @match        *://web.telegram.org/*
// @grant        none
// @require      https://greasyfork.org/scripts/38329-emojione-min-js/code/emojioneminjs.js?version=250047
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
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
		'\uD83C\uDFF3': '\uD83C\uDFF3\uFE0F\u200D'
	};

	var getImageSrc = function(shortname) {
		var tempDiv = document.createElement('div');
		tempDiv.innerHTML = emojione.toImage(replacements[shortname] || shortname);
		return Util.q('img', tempDiv).src;
	};

	var convert = function(msg, watch, watchContinuously) {
		var html = '';

		Util.qq('.emoji', msg).forEach(function(emoji) {
			emoji.outerHTML = emoji.textContent;
		});
		msg.childNodes.forEach(function(node) {
			var content = node.textContent;
			if (content) {
				for (var property in replacements) {
					if (replacements.hasOwnProperty(property)) {
						content = content.replace(new RegExp(Util.regexEscape(property), 'g'), replacements[property]);
					}
				}

				// fix for rainbow flags
				content = emojione.shortnameToUnicode(content);
				content.replace(new RegExp(Util.regexEscape('\uD83C\uDFF3\uD83C\uDF08')), 'g', '\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08');
				
				var withEmoji = emojione.toImage(content);
				if (node.nodeType === Node.TEXT_NODE) {
					html += withEmoji;
				} else {
					node.innerHTML = withEmoji;
					html += node.outerHTML;
				}
			} else {
				if (node.nodeType !== Node.TEXT_NODE) {
					html += node.outerHTML;
				}
			}
		});

		msg.innerHTML = html;
		if (watch) {
			var changes = waitForElems({
				context: msg,
				onchange: function() {
					changes.stop();
					convert(msg, watchContinuously, watchContinuously);
				}
			});
			if (!watchContinuously) {
				setTimeout(function() {
					changes.stop();
				}, 1000); // if no changes after 1 second, assume no changes
			}
		}
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
			convert(msg, true);
		}
	});

	waitForElems({
		sel: [
			'.im_short_message_text',
			'.im_short_message_media > span > span > span'
		].join(','),
		onmatch: function(msg) {
			convert(msg, true, true);
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
	waitForElems({
		context: textarea,
		onchange: function() {
			Util.qq('.emoji:not(.e1-converted)', textarea).forEach(function(emoji) {
				emoji.removeAttribute('style');
				emoji.classList.add('e1-converted');
				emoji.style.backgroundImage = 'url(' + getImageSrc(emoji.alt) + ')';
				emoji.style.backgroundSize = 'cover';
			});
		}
	});
})();
