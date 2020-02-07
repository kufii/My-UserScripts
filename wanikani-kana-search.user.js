// ==UserScript==
// @name         WaniKani Kana Search
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Search on WaniKani using hiragana
// @author       Adrien Pyke
// @match        *://www.wanikani.com/*
// @grant        none
// @require      https://unpkg.com/wanakana@4.0.2/umd/wanakana.min.js
// ==/UserScript==

(() => {
  'use strict';

  const Util = {
    q: (query, context = document) => context.querySelector(query),
    qq: (query, context = document) => [...context.querySelectorAll(query)]
  };

  const form = Util.q('#search-form');
  if (!form) return;

  const input = Util.q('#query', form);

  let kanaActive = false;

  const hookupEvents = btn =>
    (btn.onclick = () => {
      kanaActive = !kanaActive;
      btn.style.color = kanaActive ? '#333' : '#999';
      wanakana[kanaActive ? 'bind' : 'unbind'](input);
    });

  const addKanaButton = () => {
    const span = document.createElement('span');
    Object.assign(span.style, {
      position: 'absolute',
      top: '0.3em',
      right: '0.6em',
      cursor: 'pointer',
      fontWeight: 'bold',
      color: '#999',
      userSelect: 'none'
    });
    span.textContent = 'あ';
    form.appendChild(span);
    hookupEvents(span);
  };
  addKanaButton();
})();
