(function() {
	'use strict';

	var lastTarget;
	document.addEventListener('mousedown', function(e) {
		if (e.button === 1) {
			lastTarget = e.target;
		}
	});
	document.addEventListener('mouseup', function(e) {
		if (e.button === 1 && e.target === lastTarget) {
			var ev = new Event('middleclick');
			e.target.dispatchEvent(ev);
		}
	});
})();
