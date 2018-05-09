(() => {
	'use strict';

	window.GM_config = function(settings, storage = 'cfg') {
		let ret;

		settings.forEach(setting => {
			if (setting.type === 'dropdown') {
				setting.values = setting.values.map(val => {
					if (typeof val.text === 'undefined') {
						let value = val.value;
						if (typeof value === 'undefined') value = val;
						return { value, text: value };
					}
					return val;
				});
			}
		});

		const events = {
			text: 'input',
			number: 'input',
			dropdown: 'change',
			bool: 'click'
		};

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
				}

				.${prefix} input,
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
				let style = document.createElement('style');
				style.textContent = css;
				document.head.appendChild(style);
			} else {
				GM_addStyle(css);
			}
		};

		const load = function() {
			let defaults = {};
			settings.forEach(setting => {
				defaults[setting.key] = setting.default;
			});

			let cfg = (typeof GM_getValue !== 'undefined') ? GM_getValue(storage) : localStorage.getItem(storage);
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
			let data = JSON.stringify(cfg);
			(typeof GM_setValue !== 'undefined') ? GM_setValue(storage, data) : localStorage.setItem(storage, data);
		};

		const setup = function() {
			const createContainer = function() {
				let form = document.createElement('form');
				form.classList.add(prefix);
				return form;
			};
			const createTextbox = function(name, value, placeholder) {
				let input = document.createElement('input');
				input.type = 'text';
				input.name = name;
				input.value = value;
				input.placeholder = placeholder;
				return input;
			};
			const createNumber = function(name, value, placeholder, min, max, step) {
				let input = createTextbox(name, value, placeholder);
				input.type = 'number';
				input.min = min;
				input.max = max;
				input.step = step;
				return input;
			};
			const createSelect = function(name, lbl, options, value) {
				let select = document.createElement('select');
				select.name = name;

				let optgroup = document.createElement('optgroup');
				optgroup.label = lbl;
				select.appendChild(optgroup);

				options.forEach(opt => {
					let option = document.createElement('option');
					option.value = opt.value;
					option.textContent = opt.text;
					optgroup.appendChild(option);
				});

				select.value = value;
				return select;
			};
			const createCheckbox = function(name, checked) {
				let checkbox = document.createElement('input');
				checkbox.id = `${prefix}-${name}`;
				checkbox.type = 'checkbox';
				checkbox.name = name;
				checkbox.checked = checked;
				return checkbox;
			};
			const createButton = function(text, onclick, classname) {
				let button = document.createElement('button');
				button.classList.add(`${prefix}-${classname}`);
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};
			const createLabel = function(label, htmlFor) {
				let lbl = document.createElement('label');
				lbl.htmlFor = htmlFor;
				lbl.textContent = label;
				return lbl;
			};
			const init = function(cfg) {
				let controls = {};

				let div = createContainer();
				settings.forEach(setting => {
					let value = cfg[setting.key];

					let control;
					if (setting.type === 'text') {
						control = createTextbox(setting.key, value, setting.placeholder);
					} else if (setting.type === 'number') {
						control = createNumber(setting.key, value, setting.placeholder, setting.min, setting.max, setting.step);
					} else if (setting.type === 'dropdown') {
						control = createSelect(setting.key, setting.label, setting.values, value);
					} else if (setting.type === 'bool') {
						control = createCheckbox(setting.key, value);
					}

					div.appendChild(createLabel(setting.label, control.id));
					div.appendChild(control);
					controls[setting.key] = control;

					control.addEventListener(events[setting.type], () => {
						if (ret.onchange) {
							let control = controls[setting.key];
							let value = setting.type === 'bool' ? control.checked : control.value;
							ret.onchange(setting.key, value);
						}
					});
				});

				div.appendChild(createButton('Save', () => {
					settings.forEach(setting => {
						let control = controls[setting.key];
						cfg[setting.key] = setting.type === 'bool' ? control.checked : control.value;
					});
					save(cfg);

					if (ret.onsave) {
						ret.onsave(cfg);
					}

					div.remove();
				}, 'save'));

				div.appendChild(createButton('Cancel', () => {
					if (ret.oncancel) {
						ret.oncancel(cfg);
					}
					div.remove();
				}, 'cancel'));

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
