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

		const addStyle = function() {
			let style = document.createElement('style');
			style.textContent = `
				.gm-config {
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

				.gm-config label {
					grid-column: 1 / 2;
					color: black;
					text-align: right;
					font-size: small;
				}

				.gm-config input,
				.gm-config select {
					grid-column: 2 / 4;
				}

				.gm-config .gm-config-save {
					grid-column: 2 / 3;
				}

				.gm-config .gm-config-cancel {
					grid-column: 3 / 4;
				}
			`;
			document.head.appendChild(style);
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
				form.classList.add('gm-config');
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
			const createCheckbox = function(name, lbl, checked) {
				let checkbox = document.createElement('input');
				checkbox.id = `gm-config-${name}`;
				checkbox.type = 'checkbox';
				checkbox.name = name;
				checkbox.checked = checked;
				return checkbox;
			};
			const createButton = function(text, onclick, classname) {
				let button = document.createElement('button');
				button.classList.add(`gm-config-${classname}`);
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};
			const createLabel = function(name, label) {
				let lbl = document.createElement('label');
				lbl.htmlFor = name;
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
						control = createCheckbox(setting.key, setting.label, value);
					}

					div.appendChild(createLabel((setting.type === 'bool' ? 'gm-config-' : '') + setting.key, setting.label));
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
					let newSettings = {};
					settings.forEach(setting => {
						let control = controls[setting.key];
						newSettings[setting.key] = setting.type === 'bool' ? control.checked : control.value;
					});
					save(newSettings);

					if (ret.onsave) {
						ret.onsave(newSettings);
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
