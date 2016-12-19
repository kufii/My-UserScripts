(function() {
	'use strict';

	var lastTarget;
	window.addEventListener('mousedown', function(e) {
		if (e.button === 1) {
			lastTarget = e.target;
		}
	}, true);
	window.addEventListener('mouseup', function(e) {
		if (e.button === 1 && e.target === lastTarget) {
			var ev = document.createEvent("Events");
			ev.initEvent('middleclick', true, true);
			e.target.dispatchEvent(ev);
			lastTarget = null;
		}
	}, true);
})();
