// ==UserScript==
// @name         Parks Canada Umbraco Ace Editor
// @namespace    https://greasyfork.org/users/649
// @version      1.0.0
// @description  Use the Ace Editor when editing things on Umbraco on Parks Canada intranet
// @author       Adrien Pyke
// @match        *://*.apca2.gc.ca/umbraco_client/tinymce3/themes/umbraco/source_editor.htm
// @match        *://intranet2/umbraco_client/tinymce3/themes/umbraco/source_editor.htm
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://gitcdn.link/repo/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// @require      https://gitcdn.link/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @require      https://unpkg.com/prettier@2.6.2/standalone.js
// @require      https://unpkg.com/prettier@2.6.2/parser-html.js
// ==/UserScript==

/* global prettier, prettierPlugins */

(() => {
  'use strict';

  const SCRIPT_NAME = 'Parks Canada Umbraco Ace Editor';

  const Util = {
    log(...args) {
      args.unshift(`%c${SCRIPT_NAME}:`, 'font-weight: bold;color: #233c7b;');
      console.log(...args);
    },
    q(query, context = document) {
      return context.querySelector(query);
    },
    qq(query, context = document) {
      return Array.from(context.querySelectorAll(query));
    },
    addScript(src, onload) {
      const s = document.createElement('script');
      s.onload = onload;
      s.src = src;
      document.body.appendChild(s);
    },
    addScriptText(code, onload) {
      const s = document.createElement('script');
      s.onload = onload;
      s.textContent = code;
      document.body.appendChild(s);
    },
    appendAfter(elem, elemToAppend) {
      elem.parentNode.insertBefore(elemToAppend, elem.nextElementSibling);
    }
  };

  const Config = GM_config([
    {
      key: 'theme',
      label: 'Theme',
      default: 'monokai',
      type: 'dropdown',
      values: [
        'ambiance',
        'chaos',
        'chrome',
        'clouds',
        'clouds_midnight',
        'cobalt',
        'crimson_editor',
        'dawn',
        'dreamweaver',
        'eclipse',
        'github',
        'gob',
        'idle_fingers',
        'iplastic',
        'katzenmilch',
        'kr_theme',
        'kuroir',
        'merbivore',
        'merbivore_soft',
        'mono_industrial',
        'monokai',
        'solarized_dark',
        'solarized_light',
        'sqlserver',
        'terminal',
        'textmate',
        'tomorrow',
        'tomorrow_night',
        'tomorrow_night_blue',
        'tomorrow_night_bright',
        'tomorrow_night_eighties',
        'twilight',
        'vibrant_ink',
        'xcode'
      ]
    }
  ]);

  waitForElems({
    sel: '#htmlSource',
    stop: true,
    onmatch(textArea) {
      textArea.value = prettier.format(textArea.value, {
        parser: 'html',
        plugins: prettierPlugins
      });

      const wrapper = document.createElement('div');
      wrapper.id = 'ace';
      wrapper.textContent = textArea.value;

      Util.appendAfter(textArea, wrapper);

      GM_addStyle(`
        .ace_editor {
          height: 515px;
        }
        #htmlSource {
          display: none;
        }
      `);

      Util.addScript(
        'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/ace.min.js',
        () => {
          const editor = unsafeWindow.ace.edit('ace');
          editor.setTheme(`ace/theme/${Config.load().theme}`);
          editor.getSession().setMode('ace/mode/html');
          editor.resize();

          unsafeWindow.aceEditor = editor;
          unsafeWindow.originalTextArea = textArea;

          Util.addScriptText(
            'aceEditor.getSession().on("change", () => originalTextArea.value = aceEditor.getValue())'
          );

          GM_registerMenuCommand(SCRIPT_NAME + ' Settings', () =>
            Config.setup(editor)
          );
          Config.onchange = (key, value) =>
            editor.setTheme(`ace/theme/${value}`);
          Config.oncancel = cfg => editor.setTheme(`ace/theme/${cfg.theme}`);
        }
      );
    }
  });
})();
