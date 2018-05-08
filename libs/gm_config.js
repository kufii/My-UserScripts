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

		const load = function() {
			let defaults = {};
			settings.forEach(setting => {
				defaults[setting.key] = setting.default;
			});

			let cfg = GM_getValue(storage);
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
			GM_setValue(storage, JSON.stringify(cfg));
		};

		const setup = function() {
			const createContainer = function() {
				let form = document.createElement('form');
				form.id = 'gm-config';
				form.style.display = 'grid';
				form.style.alignItems = 'center';
				form.style.gridRowGap = '5px';
				form.style.gridColumnGap = '10px';
				form.style.backgroundColor = 'white';
				form.style.padding = '5px';
				form.style.border = '1px solid black';
				form.style.position = 'fixed';
				form.style.top = '0';
				form.style.right = '0';
				form.style.zIndex = 99999;
				return form;
			};
			const createTextbox = function(name, value, placeholder) {
				let input = document.createElement('input');
				input.type = 'text';
				input.name = name;
				input.value = value;
				input.placeholder = placeholder;
				input.style.gridColumn = '2/4';
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
				select.style.gridColumn = '2/4';
				return select;
			};
			const createCheckbox = function(name, lbl, checked) {
				let checkbox = document.createElement('input');
				checkbox.id = `gm-config-${name}`;
				checkbox.type = 'checkbox';
				checkbox.name = name;
				checkbox.checked = checked;
				checkbox.style.gridColumn = '2/4';
				return checkbox;
			};
			const createButton = function(text, onclick, gridColumn) {
				let button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				button.style.gridColumn = gridColumn;
				return button;
			};
			const createLabel = function(name, label) {
				let lbl = document.createElement('label');
				lbl.htmlFor = name;
				lbl.textContent = label;
				lbl.style.textAlign = 'right';
				lbl.style.gridColumn = '1/2';
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
				}, '2/3'));

				div.appendChild(createButton('Cancel', () => {
					if (ret.oncancel) {
						ret.oncancel(cfg);
					}
					div.remove();
				}, '3/4'));

				document.body.appendChild(div);
			};
			init(load());
		};

		ret = {
			load,
			save,
			setup
		};
		return ret;
	};
})();
