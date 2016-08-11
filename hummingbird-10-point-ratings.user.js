// ==UserScript==
// @name         Hummingbird 10 Point Ratings
// @namespace    https://greasyfork.org/users/649
// @version      1.4.1
// @description  Converts Hummingbird ratings to a 10 point scale
// @author       Adrien Pyke
// @match        *://hummingbird.me/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	var convertRatingsList = function(elem) {
		var origRatingNode = elem.querySelector('span');
		origRatingNode.style.display = 'none';

		var node = document.createElement('span');
		elem.appendChild(node);

		var updateRating = function() {
			if (elem.classList.contains('not-rated')) {
				node.textContent = '—';
			} else {
				node.textContent = parseInt(parseFloat(origRatingNode.textContent) * 2);
			}
		};
		updateRating();

		var fullEntry = elem.parentNode.parentNode.parentNode;
		fullEntry.addEventListener('click', function(e) {
			if (!e.target.dataset.reactid && (e.target.classList.contains('fa') || e.target.classList.contains('icon-container'))) {
				setTimeout(updateRating, 0);
			}
		});
	};
	waitForElems('#library-sections .list-item-score', convertRatingsList);

	var convertAnimePage = function() {
		var score = document.querySelector('.hb-score > h3 > .highlight');
		score.style.display = 'none';
		var newScore = score.parentNode.querySelector('.tenpoint');
		if (!newScore) {
			newScore = document.createElement('span');
			newScore.classList = score.classList;
			newScore.classList.add('tenpoint');
			score.parentNode.appendChild(newScore);
		}
		newScore.textContent = (parseFloat(score.textContent) * 2).toFixed(2);

		var columns = [].slice.call(document.querySelectorAll('.community-rating-wrapper > li'));
		columns.forEach(function(column) {
			var tooltipData = column.dataset.tooltip.split(' ');
			tooltipData[tooltipData.length - 1] = parseInt(tooltipData[tooltipData.length - 1] * 2);
			var tooltip = tooltipData.join(' ');
			column.dataset.tooltip = tooltip;
			column.setAttribute('title', tooltip);
		});

		var stars = [].slice.call(document.querySelectorAll('.lowest-rating > .fa-star-half-o, .highest-rating > .fa-star'));
		if (stars.length > 0) {
			stars.forEach(function(star) {
				star.remove();
			});
			var lowestRating = document.querySelector('.lowest-rating');
			lowestRating.innerHTML = 0 + lowestRating.innerHTML;
			var highestRating = document.querySelector('.highest-rating');
			highestRating.innerHTML += 10;
		}
	};
	waitForUrl(/^https?:\/\/hummingbird\.me\/(anime|manga)\/[^/]+\/?(\?*)?$/, convertAnimePage);

	var convertReviewPage = function() {
		waitForElems('.review-breakdown', function(review) {
			var verdict = review.querySelector('.score-block');
			var rating = parseFloat(verdict.querySelector('.score').textContent + verdict.querySelector('.decimal-score').textContent);
			verdict.innerHTML = '';
			var newScore = document.createElement('h1');
			newScore.classList.add('score');
			newScore.textContent = parseInt(rating * 2);
			verdict.appendChild(newScore);

			var breakdown = [].slice.call(review.querySelectorAll('.dec-score > strong'));
			breakdown.forEach(function(entry) {
				entry.textContent = parseInt(parseFloat(entry.textContent) * 2);
			});
		}, true);
	};
	waitForUrl(/^https?:\/\/hummingbird\.me\/(anime|manga)\/[^/]+\/reviews\/[^/]+\/?(\?*)?$/, convertReviewPage);
})();
