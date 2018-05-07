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
				let div = document.createElement('div');
				div.style.backgroundColor = 'white';
				div.style.padding = '5px';
				div.style.border = '1px solid black';
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.right = '0';
				div.style.zIndex = 99999;
				return div;
			};
			const createTextbox = function(value, placeholder) {
				let input = document.createElement('input');
				input.setAttribute('type', 'text');
				input.value = value;
				if (placeholder) {
					input.setAttribute('placeholder', placeholder);
				}
				return input;
			};
			const createNumber = function(value, placeholder, min, max, step) {
				let input = createTextbox(value, placeholder);
				input.setAttribute('type', 'number');
				input.setAttribute('min', min);
				input.setAttribute('max', max);
				input.setAttribute('step', step);
				return input;
			};
			const createSelect = function(lbl, options, value) {
				let select = document.createElement('select');
				select.style.margin = '2px';
				let optgroup = document.createElement('optgroup');
				if (lbl) {
					optgroup.setAttribute('label', lbl);
				}
				select.appendChild(optgroup);
				options.forEach(opt => {
					let option = document.createElement('option');
					option.setAttribute('value', opt.value);
					option.textContent = opt.text;
					optgroup.appendChild(option);
				});
				select.value = value;
				return select;
			};
			const createCheckbox = function(lbl, checked) {
				let label = document.createElement('label');
				let checkbox = document.createElement('input');
				checkbox.setAttribute('type', 'checkbox');
				label.appendChild(checkbox);
				label.querySelector('input').checked = checked;
				label.appendChild(document.createTextNode(lbl));
				return label;
			};
			const createButton = function(text, onclick) {
				let button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};
			const createLabel = function(label) {
				let lbl = document.createElement('span');
				lbl.textContent = label;
				return lbl;
			};
			const createLineBreak = function() {
				return document.createElement('br');
			};
			const init = function(cfg) {
				let controls = {};

				let div = createContainer();
				settings.forEach(setting => {
					let value = cfg[setting.key];

					let control;
					if (setting.type === 'text') {
						control = createTextbox(value, setting.placeholder);
					} else if (setting.type === 'number') {
						control = createNumber(value, setting.placeholder, setting.min, setting.max, setting.step);
					} else if (setting.type === 'dropdown') {
						control = createSelect(setting.label, setting.values, value);
					} else if (setting.type === 'bool') {
						control = createCheckbox(setting.label, value);
					}

					if (setting.type === 'bool') {
						controls[setting.key] = control.querySelector('input');
					} else {
						controls[setting.key] = control;
						div.appendChild(createLabel(`${setting.label}: `));
					}

					controls[setting.key].addEventListener(events[setting.type], () => {
						if (ret.onchange) {
							let control = controls[setting.key];
							let value = setting.type === 'bool' ? control.checked : control.value;
							ret.onchange(setting.key, value);
						}
					});

					div.appendChild(control);
					div.appendChild(createLineBreak());
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
				}));

				div.appendChild(createButton('Cancel', () => {
					if (ret.oncancel) {
						ret.oncancel(cfg);
					}
					div.remove();
				}));

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
