// ==UserScript==
// @name         Imgur Mirror
// @namespace    https://greasyfork.org/users/649
// @version      1.0.14
// @description  Switches all imgur links to the mirror site http://kageurufu.net/imgur
// @author       Adrien Pyke
// @include      http*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	var regex = /imgur\.com\/(?!a\/|gallery\/)(?:r\/[a-z0-9_]+\/)?([a-z0-9]+)(\.+[a-z0-9]+)?/i;

	var getNewLink = function(imgurLink, useGif) {
		var match = imgurLink.match(regex);
		if (match) {
			var file = match[1];
			var extension = match[2];
			if (!extension) {
				extension = '.png';
			} else if (extension === '.gifv' || extension === '.gif' || extension === '.webm') {
				extension = '.mp4';
			}
			if (useGif && extension === '.mp4') {
				extension = '.gif';
			}
			return 'http://kageurufu.net/imgur/?' + file + extension;
		} else {
			return null;
		}
	};

	waitForElems('img,a', function(node) {
		var isImg = node.nodeName === 'IMG';
		var prop = isImg ? 'src' : 'href';
		var newLink = getNewLink(node[prop], isImg);
		if(newLink) {
			node[prop] = newLink;
			if (node.dataset.hrefUrl) {
				node.dataset.hrefUrl = newLink;
			}
			if (node.dataset.outboundUrl) {
				node.dataset.outboundUrl = newLink;
			}
		}
	});
})();
