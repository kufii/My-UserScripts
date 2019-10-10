(() => {
	'use strict';

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
			if (typeof GM_addStyle === 'undefined') {
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
				typeof GM_getValue !== 'undefined'
					? GM_getValue(storage)
					: localStorage.getItem(storage);
			if (!cfg) return defaults;

			cfg = JSON.parse(cfg);
			Object.entries(defaults).forEach(([key, value]) => {
				if (typeof cfg[key] === 'undefined') {
					cfg[key] = value;
				}
			});

			return cfg;
		};

		const save = function(cfg) {
			const data = JSON.stringify(cfg);
			typeof GM_setValue !== 'undefined'
				? GM_setValue(storage, data)
				: localStorage.setItem(storage, data);
		};

		const setup = function() {
			const createContainer = function() {
				const form = document.createElement('form');
				form.classList.add(prefix);
				return form;
			};
			const createTextbox = function(name, value, placeholder, maxLength, multiline, resize) {
				const input = document.createElement(multiline ? 'textarea' : 'input');
				if (multiline) {
					input.style.resize = resize ? 'vertical' : 'none';
				} else {
					input.type = 'text';
				}
				input.name = name;
				if (typeof value !== 'undefined') input.value = value;
				if (placeholder) input.placeholder = placeholder;
				if (maxLength) input.maxLength = maxLength;
				return input;
			};
			const createNumber = function(name, value, placeholder, min, max, step) {
				const input = createTextbox(name, value, placeholder);
				input.type = 'number';
				if (typeof min !== 'undefined') input.min = min;
				if (typeof max !== 'undefined') input.max = max;
				if (typeof step !== 'undefined') input.step = step;
				return input;
			};
			const createSelect = function(name, options, value, showBlank) {
				const select = document.createElement('select');
				select.name = name;

				const createOption = function(val) {
					const { value = val, text = val } = val;
					const option = document.createElement('option');
					option.value = value;
					option.textContent = text;
					return option;
				};

				if (showBlank) {
					select.appendChild(createOption(''));
				}

				options.forEach(opt => {
					if (typeof opt.optgroup !== 'undefined') {
						const optgroup = document.createElement('optgroup');
						optgroup.label = opt.optgroup;
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
				const checkbox = document.createElement('input');
				checkbox.id = `${prefix}-${name}`;
				checkbox.type = 'checkbox';
				checkbox.name = name;
				checkbox.checked = checked;
				return checkbox;
			};
			const createKeybinding = function(name, keybinding, requireModifier, requireKey) {
				const textbox = document.createElement('input');
				textbox.type = 'text';
				textbox.name = name;
				textbox.readOnly = true;
				textbox.placeholder = 'Press Keybinding';

				const {
					ctrlKey = false,
					altKey = false,
					shiftKey = false,
					metaKey = false,
					key = ''
				} = keybinding || {};

				const setText = () => {
					const parts = [];
					const { ctrlKey, altKey, shiftKey, metaKey, key } = textbox.dataset;
					if (ctrlKey === 'true') parts.push('CTRL');
					if (altKey === 'true') parts.push('ALT');
					if (shiftKey === 'true') parts.push('SHIFT');
					if (metaKey === 'true') parts.push('META');
					if (key && !['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) parts.push(key);
					textbox.value = parts.join(' + ');
				};

				const setDataset = (ctrlKey, altKey, shiftKey, metaKey, key) => {
					textbox.dataset.ctrlKey = ctrlKey;
					textbox.dataset.altKey = altKey;
					textbox.dataset.shiftKey = shiftKey;
					textbox.dataset.metaKey = metaKey;
					textbox.dataset.key = key || '';
					setText();
				};

				setDataset(ctrlKey, altKey, shiftKey, metaKey, key);

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
						let { ctrlKey, altKey, shiftKey, metaKey, key } = e;
						if (requireModifier && !ctrlKey && !altKey && !shiftKey && !metaKey)
							return false;
						key = (key || '').toUpperCase();
						if (
							requireKey &&
							(!key || ['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key))
						)
							return false;
						setDataset(ctrlKey, altKey, shiftKey, metaKey, key);
						return false;
					},
					true
				);
				textbox.addEventListener('keypress', preventDefault, true);

				return textbox;
			};
			const createButton = function(text, onclick, classname) {
				const button = document.createElement('button');
				button.classList.add(`${prefix}-${classname}`);
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};
			const createLabel = function(label, htmlFor) {
				const lbl = document.createElement('label');
				if (htmlFor) lbl.htmlFor = htmlFor;
				lbl.textContent = label;
				return lbl;
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
