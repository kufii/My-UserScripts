# Libraries

Any libs I made to help with userscript development.

## GM_config

A lib that provides an API to store and retrieve userscript settings, and also provides a UI for users to modify them.

```javascript
GM_config(settings, storage = 'cfg')
```

### Usage:

To use this library, require `gm_config.js`. You must also grant `GM_getValue` and `GM_setValue` for it to function. If you want to hook it up to a GreaseMonkey menu command you should also grant `GM_registerMenuCommand`.

Example:

```javascript
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/15a602c2a868c94a9477b34a8e2a37232c5e12c6/libs/gm_config.js

const Config = GM_config([
	{
		key: 'opt1'
		label: 'Textbox Option',
		type: 'text'
	}, {
		key: 'opt2',
		label: 'Checkbox Option',
		type: 'bool',
	}, {
		key: 'opt3',
		label: 'Dropdown Option',
		default: 4,
		type: 'dropdown',
		values: [1, 2, 3, 4, 5]
	}
]);
```

### Parameters:

**`settings`**: An array of settings objects  
**`storage`**: Optional. Defines what variable the settings will be stored under. Default is `cfg`.

### Settings Objects:

```javascript
{
	// The key for the setting.
	key: 'mysetting',

	// The label that'll be used for the setting in the UI.
	label: 'Enter Value',

	// Optional. The default value for the setting.
	default: 'default',

	// What type of setting it is. "text" will show a textbox, "dropdown" will show a dropdown list, "bool" will show a checkbox.
	type: 'text|dropdown|bool',

	// Optional. For use when the type is "text". Placeholder text for the textbox.
	placeholder: 'Placeholder',

	// For use when the type is "dropdown". Takes an array of values, or an array of objects with a "value" property and "text" property
	values: [
		{ value: 1, text: 'Option 1' },
		{ value: 2, text: 'Option 2'}
	]
}
```

### Functions:

**`load()`**: Returns an object containing the currently stored settings.  
**`save(cfg)`**: Takes a configuration object and saves it to storage.  
**`setup()`**: Initializes a UI for the user to modify the settings.

### Using the UI:
You can hook the setup to a GreaseMonkey menu command by granting `GM_registerMenuCommand` and doing the following

```javascript
GM_registerMenuCommand('Command Text', Config.setup);
```

### Events:
GM_config has the following events:

**`onchange(key, value)`**: Fires when a user changes a setting, but before saving.  
**`onsave(cfg)`**: Fires when the user clicks save.  
**`oncancel(cfg)`**: Fires when the user clicks cancel.

Example:

```javascript
Config.onchange = (key, value) => console.log(key, value);
```
