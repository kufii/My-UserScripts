// ==UserScript==
// @name         Reddit Flair Linkifier
// @namespace    https://greasyfork.org/users/649
// @version      2.1.6
// @description  Turns the text in various subreddits' flair into links
// @author       Adrien Pyke
// @match        *://*.reddit.com/*
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @grant        GM_addStyle
// ==/UserScript==

(() => {
  'use strict';

  GM_addStyle(`
		.flair-link {
			text-decoration: none;
		}
		.flair-link:hover {
			text-decoration: underline;
		}
	`);

  const newLayoutId = '#SHORTCUT_FOCUSABLE_DIV';

  waitForElems({
    sel: [
      // old reddit
      'span.flair',
      'span.Comment__authorFlair',

      // new reddit
      `${newLayoutId} span`
    ].join(','),
    onmatch(flair) {
      if (
        flair.childNodes.length !== 1 ||
        flair.childNodes[0].nodeType !== Node.TEXT_NODE ||
        flair.closest('.DraftEditor-root')
      )
        return;
      const newhtml = flair.textContent
        .split(' ')
        .map(segment =>
          segment.match(/^https?:\/\//u)
            ? `<a href="${segment}" class="flair-link" target="_blank" rel="noopener noreferrer">${segment}</a>`
            : segment
        )
        .join(' ');
      if (flair.innerHTML !== newhtml) flair.innerHTML = newhtml;
    }
  });
})();
