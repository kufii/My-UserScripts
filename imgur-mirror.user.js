// ==UserScript==
// @name         Imgur Mirror
// @namespace    https://greasyfork.org/users/649
// @version      1.1.3
// @description  Switches all imgur links to the mirror site http://kageurufu.net/imgur
// @author       Adrien Pyke
// @include      http*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/89e64ca31aa4c27ce8bc68a84ffac53e06f074c0/wait-for-elements/wait-for-elements.js
// @grant        none
// ==/UserScript==

(() => {
	'use strict';

	const regex = /imgur\.com\/(?!a\/|gallery\/)(?:r\/[a-z0-9_]+\/)?([a-z0-9]+)(\.+[a-z0-9]+)?/i;
	const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.gifv', '.webm', '.mp4'];

	const getNewLink = function(imgurLink, useGif) {
		const match = imgurLink.match(regex);
		if (match) {
			const file = match[1];
			let extension = match[2].toLowerCase();
			if (!extension || !extensions.includes(extension)) {
				extension = '.png';
			} else if (extension === '.gifv' || extension === '.gif' || extension === '.webm') {
				extension = '.mp4';
			}
			if (useGif && extension === '.mp4') {
				extension = '.gif';
			}
			return `http://kageurufu.net/imgur/?${file + extension}`;
		} else {
			return null;
		}
	};

	waitForElems({
		sel: 'img,a',
		onmatch(node) {
			const isImg = node.nodeName === 'IMG';
			const prop = isImg ? 'src' : 'href';
			const newLink = getNewLink(node[prop], isImg);
			if (newLink) {
				node[prop] = newLink;
				if (node.dataset.hrefUrl) {
					node.dataset.hrefUrl = newLink;
				}
				if (node.dataset.outboundUrl) {
					node.dataset.outboundUrl = newLink;
				}
			}
		}
	});
})();
