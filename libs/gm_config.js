(() => {
	'use strict';

	const fromEntries =
		Object.fromEntries ||
		((...iterable) =>
			[...iterable].reduce((obj, [key, val]) => {
				obj[key] = val;
				return obj;
			}, {}));

	window.GM_config = function(settings, storage = 'cfg') {
		let ret = null;

		const prefix = 'gm-config';

		const addStyle = function() {
			const css = `
				.${prefix} {
					display: grid;
					align-items: center;
					grid-row-gap: 5px;
					grid-column-gap: 10px;
					background-color: white;
					border: 1px solid black;
					padding: 5px;
					position: fixed;
					top: 0;
					right: 0;
					z-index: 2147483647;
				}

				.${prefix} label {
					grid-column: 1 / 2;
					color: black;
					text-align: right;
					font-size: small;
					font-weight: bold;
				}

				.${prefix} input,
				.${prefix} textarea,
				.${prefix} select {
					grid-column: 2 / 4;
				}

				.${prefix} .${prefix}-save {
					grid-column: 2 / 3;
				}

				.${prefix} .${prefix}-cancel {
					grid-column: 3 / 4;
				}
			`;
			if (window.GM_addStyle == null) {
				const style = document.createElement('style');
				style.textContent = css;
				document.head.appendChild(style);
			} else {
				GM_addStyle(css);
			}
		};

		const load = function() {
			const defaults = {};
			settings.forEach(({ key, default: def }) => (defaults[key] = def));

			let cfg =
				window.GM_getValue != null ? GM_getValue(storage) : localStorage.getItem(storage);
			if (!cfg) return defaults;

			cfg = JSON.parse(cfg);
			Object.entries(defaults).forEach(([key, value]) => {
				if (cfg[key] == null) {
					cfg[key] = value;
				}
			});

			return cfg;
		};

		const save = function(cfg) {
			const data = JSON.stringify(cfg);
			window.GM_setValue != null
				? GM_setValue(storage, data)
				: localStorage.setItem(storage, data);
		};

		const setup = function() {
			const makeElem = (type, opts = {}) =>
				Object.assign(
					document.createElement(type),
					fromEntries(Object.entries(opts).filter(([_, value]) => value != null))
				);
			const createContainer = function() {
				const form = makeElem('form');
				form.classList.add(prefix);
				return form;
			};
			const createTextbox = function(name, value, placeholder, maxLength, multiline, resize) {
				const input = makeElem(multiline ? 'textarea' : 'input', {
					type: multiline ? null : 'text',
					name,
					value,
					placeholder,
					maxLength
				});
				if (multiline) {
					input.style.resize = resize ? 'vertical' : 'none';
				}
				return input;
			};
			const createNumber = function(name, value, placeholder, min, max, step) {
				return makeElem('input', {
					type: 'number',
					value,
					placeholder,
					min,
					max,
					step
				});
			};
			const createSelect = function(name, options, value, showBlank) {
				const select = makeElem('select', { name });

				const createOption = val => {
					const { value = val, text = val } = val;
					return makeElem('option', { value, textContent: text });
				};

				if (showBlank) {
					select.appendChild(createOption(''));
				}

				options.forEach(opt => {
					if (opt.optgroup != null) {
						const optgroup = makeElem('optgroup', { label: opt.optgroup });
						select.appendChild(optgroup);
						opt.values.forEach(value => optgroup.appendChild(createOption(value)));
					} else {
						select.appendChild(createOption(opt));
					}
				});

				select.value = value;
				return select;
			};
			const createCheckbox = function(name, checked) {
				return makeElem('input', {
					type: 'checkbox',
					id: `${prefix}-${name}`,
					name,
					checked
				});
			};
			const createKeybinding = function(name, keybinding, requireModifier, requireKey) {
				const textbox = makeElem('input', {
					type: 'text',
					name,
					readOnly: true,
					placeholder: 'Press Keybinding'
				});

				const setText = () => {
					const parts = [];
					const d = textbox.dataset;
					if (d.ctrlKey === 'true') parts.push('CTRL');
					if (d.altKey === 'true') parts.push('ALT');
					if (d.shiftKey === 'true') parts.push('SHIFT');
					if (d.metaKey === 'true') parts.push('META');
					if (d.key && !['CONTROL', 'ALT', 'SHIFT', 'META'].includes(d.key))
						parts.push(d.key);
					textbox.value = parts.join('+');
				};

				const setDataset = ({
					ctrlKey = false,
					altKey = false,
					shiftKey = false,
					metaKey = false,
					key = ''
				} = {}) => {
					Object.assign(textbox.dataset, {
						ctrlKey,
						altKey,
						shiftKey,
						metaKey,
						key: key.toUpperCase()
					});
					setText();
				};

				setDataset(keybinding);

				const preventDefault = e => {
					e.preventDefault();
					e.stopImmediatePropagation();
					e.stopPropagation();
					return false;
				};

				textbox.addEventListener(
					'keydown',
					e => {
						preventDefault(e);
						if (requireModifier && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey)
							return false;
						const key = (e.key || '').toUpperCase();
						if (
							requireKey &&
							(!key || ['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key))
						)
							return false;
						setDataset(e);
						return false;
					},
					true
				);
				textbox.addEventListener('keypress', preventDefault, true);

				return textbox;
			};
			const createButton = function(text, onclick, classname) {
				const button = makeElem('button', {
					textContent: text,
					onclick
				});
				button.classList.add(`${prefix}-${classname}`);
				return button;
			};
			const createLabel = function(label, htmlFor) {
				return makeElem('label', { htmlFor, textContent: label });
			};
			const init = function(cfg) {
				const controls = {};

				const getValue = (type, control) => {
					const getKeybindingValue = () => {
						const ctrlKey = control.dataset.ctrlKey === 'true';
						const altKey = control.dataset.altKey === 'true';
						const shiftKey = control.dataset.shiftKey === 'true';
						const metaKey = control.dataset.metaKey === 'true';
						const key = control.dataset.key;
						return { ctrlKey, altKey, shiftKey, metaKey, key };
					};
					return type === 'bool'
						? control.checked
						: type === 'keybinding'
						? getKeybindingValue()
						: control.value;
				};

				const div = createContainer();
				settings
					.filter(({ type }) => type !== 'hidden')
					.forEach(setting => {
						const value = cfg[setting.key];

						let control;
						if (setting.type === 'text') {
							control = createTextbox(
								setting.key,
								value,
								setting.placeholder,
								setting.maxLength,
								setting.multiline,
								setting.resizable
							);
						} else if (setting.type === 'number') {
							control = createNumber(
								setting.key,
								value,
								setting.placeholder,
								setting.min,
								setting.max,
								setting.step
							);
						} else if (setting.type === 'dropdown') {
							control = createSelect(
								setting.key,
								setting.values,
								value,
								setting.showBlank
							);
						} else if (setting.type === 'bool') {
							control = createCheckbox(setting.key, value);
						} else if (setting.type === 'keybinding') {
							control = createKeybinding(
								setting.key,
								value,
								setting.requireModifier,
								setting.requireKey
							);
						}

						div.appendChild(createLabel(setting.label, control.id));
						div.appendChild(control);
						controls[setting.key] = control;

						control.addEventListener(
							setting.type === 'dropdown' ? 'change' : 'input',
							() => {
								if (ret.onchange) {
									const control = controls[setting.key];
									ret.onchange(setting.key, getValue(setting.type, control));
								}
							}
						);
					});

				div.appendChild(
					createButton(
						'Save',
						() => {
							settings
								.filter(({ type }) => type !== 'hidden')
								.forEach(({ key, type }) => {
									const control = controls[key];
									cfg[key] = getValue(type, control);
								});
							save(cfg);

							if (ret.onsave) {
								ret.onsave(cfg);
							}

							div.remove();
						},
						'save'
					)
				);

				div.appendChild(
					createButton(
						'Cancel',
						() => {
							if (ret.oncancel) {
								ret.oncancel(cfg);
							}
							div.remove();
						},
						'cancel'
					)
				);

				document.body.appendChild(div);
			};
			init(load());
		};

		addStyle();

		ret = {
			load,
			save,
			setup
		};
		return ret;
	};
})();
