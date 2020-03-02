// ==UserScript==
// @name         LingoDeer Auto Write Myself
// @namespace    https://greasyfork.org/users/649
// @version      1.0.2
// @description  Auto switch to "Write Myself", and adds press enter to continue.
// @author       Adrien Pyke
// @match        *://www.lingodeer.com/learn-languages/*
// @grant        none
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// ==/UserScript==

(() => {
  'use strict';

  let helpClicked = false;
  waitForElems({
    sel: '.switchBtn',
    onmatch: btn => {
      if (btn.textContent.trim() === 'I want to write it myself' && !helpClicked) btn.click();
      else btn.addEventListener('click', () => (helpClicked = true));
      helpClicked = false;
    }
  });
  waitForElems({
    sel: '.textAreaInput textarea',
    onmatch: input => (
      input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const btn = document.querySelector('.checkBtn.active, .continueBtn:not(.wrong)');
        btn && btn.click();
        e.preventDefault();
        return false;
      }),
      input.focus()
    )
  });
  waitForElems({
    sel: '.signBtn',
    stop: true,
    onmatch: btn => btn.click()
  });
})();
