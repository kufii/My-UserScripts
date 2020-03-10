// ==UserScript==
// @name         WaniKani Pitch Accent
// @namespace    https://greasyfork.org/users/649
// @version      1.0
// @description  Show pitch accent data on WaniKani
// @author       Adrien Pyke
// @match        *://www.wanikani.com/vocabulary/*
// @match        *://www.wanikani.com/level/*/vocabulary/*
// @match        *://www.wanikani.com/review/session
// @match        *://www.wanikani.com/lesson/session
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @require      https://gitcdn.xyz/repo/IllDepence/SVG_pitch/295af214b1e3c8add03a31cf022e28033495da08/accdb.js
// @grant        none
// ==/UserScript==
/* global acc_dict */

(() => {
  'use strict';

  const Util = {
    toMoraArray: kana => kana.match(/.[ゃゅょぁぃぅぇぉャュョァィゥェォ]?/gu),
    getAccentData: (kanji, reading) => {
      const [kana, pitch] = (acc_dict[kanji] && acc_dict[kanji].find(([r]) => r === reading)) || [];
      if (!kana) return [];
      return [Util.toMoraArray(kana), [...pitch.replace(/[lh]/gu, '')]];
    }
  };

  const Draw = {
    textGeneric: (x, text) =>
      `<text x="${x}" y="67.5" style="font-size:20px;fill:#000;">${text}</text>`,
    text: (x, mora) =>
      mora.length === 1
        ? Draw.textGeneric(x, mora)
        : Draw.textGeneric(x - 5, mora[0]) + Draw.textGeneric(x + 12, mora[1]),
    circle: (x, y, empty) =>
      `
        <circle r="5" cx="${x}" cy="${y}" style="opacity:1;fill:#000;" />
      ` + (empty ? `<circle r="3.25" cx="${x}" cy="${y}" style="opacity:1;fill:#fff;" />` : ''),
    path: (x, y, type, stepWidth) =>
      `
      <path d="m ${x},${y} ${stepWidth},${
        { s: 0, u: -25, d: 25 }[type]
      }" style="fill:none;stroke:#000;stroke-width:1.5;" />
    `,
    svg: (kanji, reading) => {
      const [mora, pitch] = Util.getAccentData(kanji, reading);
      if (!mora) return;

      const stepWidth = 35,
        marginLr = 16;
      const positions = Math.max(mora.length, pitch.length);
      const svgWidth = Math.max(0, (positions - 1) * stepWidth + marginLr * 2);
      const getXCenter = step => marginLr + step * stepWidth;
      const getYCenter = type => (type === 'H' ? 5 : 30);

      const chars = mora.map((kana, i) => Draw.text(getXCenter(i) - 11, kana)).join('');
      const paths = pitch
        .slice(1)
        .map((type, i) => ({
          prevXCenter: getXCenter(i),
          prevYCenter: getYCenter(pitch[i]),
          yCenter: getYCenter(type)
        }))
        .map(({ prevXCenter, prevYCenter, yCenter }) =>
          Draw.path(
            prevXCenter,
            prevYCenter,
            prevYCenter < yCenter ? 'd' : prevYCenter > yCenter ? 'u' : 's',
            stepWidth
          )
        )
        .join('');
      const circles = pitch
        .map((type, i) => Draw.circle(getXCenter(i), getYCenter(type), i >= mora.length))
        .join('');

      return `
        <svg width="${svgWidth}px" height="75px" viewBox="0 0 ${svgWidth} 74">
          ${chars + paths + circles}
        </svg>
      `.trim();
    }
  };
})();
