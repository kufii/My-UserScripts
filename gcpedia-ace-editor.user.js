// ==UserScript==
// @name         GCPedia Ace Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Use the Ace Editor when editing things on GCPedia
// @author       Adrien Pyke
// @match        http://www.gcpedia.gc.ca/gcwiki/index.php*
// @grant        none
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'GCPedia Ace Editor';

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
		addScript: function(src, onload) {
			var s = document.createElement('script');
			s.onload = onload;
			s.src = src;
			document.body.appendChild(s);
		},
		appendStyle: function(css) {
			var out = '';
			for (var selector in css) {
				out += selector + '{';
				for (var rule in css[selector]) {
					out += rule + ':' + css[selector][rule] + '!important;';
				}
				out += '}';
			}

			var style = document.createElement('style');
			style.type = 'text/css';
			style.appendChild(document.createTextNode(out));
			document.head.appendChild(style);
		},
		appendAfter: function(elem, elemToAppend) {
			elem.parentNode.insertBefore(elemToAppend, elem.nextElementSibling);
		}
	};

	waitForElems({
		sel: '.wikiEditor-ui',
		stop: true,
		onmatch: function() {
			var textArea = Util.q('#wpTextbox1');

			var wrapper = document.createElement('div');
			wrapper.id = 'ace';
			wrapper.textContent = textArea.value;

			Util.appendAfter(Util.q('.wikiEditor-ui'), wrapper);

			Util.appendStyle({
				'.ace_editor': {
					height: '600px'
				},
				'.wikiEditor-ui': {
					display: 'none'
				}
			});
			Util.addScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.8/ace.js', function() {
				var editor = ace.edit('ace');
				editor.setTheme('ace/theme/monokai');
				editor.getSession().setMode("ace/mode/html");
				editor.resize();
				editor.getSession().on('change', function(e) {
					textArea.value = editor.getValue();
				});
			});
		}
	});
})();
