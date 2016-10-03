// ==UserScript==
// @name         Hummingbird Fansub Info
// @namespace    https://greasyfork.org/users/649
// @version      1.2
// @description  Show MAL fansub info on Hummingbird anime pages
// @author       Adrien Pyke
// @match        *://hummingbird.me/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
	'use strict';

	var SCRIPT_NAME = 'Hummingbird Fansub Info';
	var API = 'https://hummingbird.me/api/v1';
	var REGEX = /^https?:\/\/hummingbird\.me\/anime\/([^\/]+)\/?(?:\?.*)?$/;
	var DIV_ID = 'hbfs-fansubs';

	GM_addStyle('.trending-review-empty { margin-bottom: 20px; }');

	var Util = {
		log: function() {
			var args = [].slice.call(arguments);
			args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');
			console.log.apply(console, args);
		},
		q: function(query, context) {
			return (context || document).querySelector(query);
		},
		qq: function(query, context) {
			return [].slice.call((context || document).querySelectorAll(query));
		},
		setNewTab: function(node) {
			node.setAttribute('target', '_blank');
			node.setAttribute('rel', 'noopener noreferrer');
		},
		icon: function(name) {
			var icon = document.createElement('i');
			icon.classList.add('fa', 'fa-' + name);
			return icon;
		},
		createModal: function(title, bodyDiv) {
			var div = document.createElement('div');
			div.classList.add('edit-series-modal');
			var modal = document.createElement('div');
			modal.classList.add('modal');
			modal.style.display = 'block';
			div.appendChild(modal);
			var backdrop = document.createElement('div');
			backdrop.classList.add('modal-backdrop', 'fade', 'in');
			div.appendChild(backdrop);
			var dialog = document.createElement('div');
			dialog.classList.add('modal-dialog');
			modal.appendChild(dialog);
			var content = document.createElement('div');
			content.classList.add('modal-content');
			dialog.appendChild(content);
			var header = document.createElement('div');
			header.classList.add('modal-header');
			content.appendChild(header);
			var body = document.createElement('div');
			body.classList.add('modal-body');
			content.appendChild(body);

			var h4 = document.createElement('h4');
			h4.classList.add('modal-title');
			h4.textContent = title;
			header.appendChild(h4);

			body.appendChild(bodyDiv);

			div.onclick = function(e) {
				if (e.target === modal || e.target === backdrop) {
					div.remove();
				}
			};
			document.body.appendChild(div);
		}
	};

	var Config = {
		load: function() {
			var defaults = {
				lang: null
			};

			var cfg = GM_getValue('cfg');
			if (!cfg) return defaults;

			cfg = JSON.parse(cfg);
			for (var property in defaults) {
				if (defaults.hasOwnProperty(property)) {
					if (!cfg[property]) {
						cfg[property] = defaults[property];
					}
				}
			}

			return cfg;
		},

		save: function(cfg) {
			GM_setValue('cfg', JSON.stringify(cfg));
		},

		setup: function() {
			var createContainer = function() {
				var div = document.createElement('div');
				div.style.backgroundColor = 'white';
				div.style.padding = '5px';
				div.style.border = '1px solid black';
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.right = '0';
				div.style.zIndex = 99999;
				return div;
			};

			var createButton = function(text, onclick) {
				var button = document.createElement('button');
				button.style.margin = '2px';
				button.textContent = text;
				button.onclick = onclick;
				return button;
			};

			var createTextbox = function(value, placeholder) {
				var input = document.createElement('input');
				input.value = value;
				if (placeholder) {
					input.setAttribute('placeholder', placeholder);
				}
				return input;
			};

			var createLabel = function(label) {
				var lbl = document.createElement('span');
				lbl.textContent = label;
				return lbl;
			};

			var createLineBreak = function() {
				return document.createElement('br');
			};

			var init = function(cfg) {
				var div = createContainer();

				var lang = createTextbox(cfg.lang, 'Languages (Comma Seperated)');
				div.appendChild(createLabel('Languages: '));
				div.appendChild(lang);
				div.appendChild(createLineBreak());

				div.appendChild(createButton('Save', function(e) {
					var settings = {
						lang: lang.value
					};
					Config.save(settings);
					div.remove();
				}));

				div.appendChild(createButton('Cancel', function(e) {
					div.remove();
				}));

				document.body.appendChild(div);
			};
			init(Config.load());
		}
	};
	GM_registerMenuCommand('Hummingbird Fansub Info Settings', Config.setup);

	var App = {
		fansubCache: {},
		websiteCache: {},
		getHummingbirdInfo: function(id, cb) {
			Util.log('Loading Hummingbird info...');
			GM_xmlhttpRequest({
				method: 'GET',
				url: API + '/anime/' + id,
				onload: function(response) {
					Util.log('Loaded Hummingbird info.');
					cb(JSON.parse(response.responseText));
				},
				onerror: function(err) {
					Util.log('Error loading Hummingbird info.');
				}
			});
		},
		getMALFansubInfo: function(malid, cb) {
			Util.log('Loading MAL info...');
			var url = 'myanimelist.net/anime/' + malid;
			GM_xmlhttpRequest({
				method: 'GET',
				url: 'https://' + url,
				onload: function(response) {
					Util.log('Loaded MAL info.');
					var tempDiv = document.createElement('div');
					tempDiv.innerHTML = response.responseText;

					var fansubDiv = Util.q('#inlineContent', tempDiv);
					if (fansubDiv) {
						fansubDiv = fansubDiv.parentNode;
						var fansubs = Util.qq('.spaceit_pad', fansubDiv).filter(function(node) {
							// only return nodes without an id
							return !node.id;
						}).map(function(node) {
							var id = Util.q('a:nth-of-type(1)', node).dataset.groupId;
							var link = Util.q('a:nth-of-type(4)', node);
							var tagNode = Util.q('small:nth-of-type(1)', node);
							var tag = (tagNode && tagNode.textContent !== '[]') ? tagNode.textContent : null;
							var langNode = Util.q('small:nth-of-type(2)', node);
							var lang = (langNode) ? langNode.textContent.substring(1, langNode.textContent.length - 1) : null;
							var approvalNode = Util.q('a:nth-of-type(5) > small', node);
							var totalApproved = 0;
							var totalVotes = 0;
							var comments = [];
							if (approvalNode) {
								var match = approvalNode.textContent.match(/([0-9]+)[^0-9]*([0-9]+)/);
								if (match) {
									totalApproved = match[1];
									totalVotes = match[2];
									comments = Util.qq('#fsgComments' + id + ' > .spaceit', node).map(function(comment) {
										return {
											text: comment.textContent,
											approves: !comment.hasAttribute('style')
										};
									});
								}
							}
							return {
								id: id,
								name: link.textContent,
								url: 'http://myanimelist.net' + link.pathname + link.search,
								tag: tag,
								lang: lang,
								totalVotes: totalVotes,
								totalApproved: totalApproved,
								comments: comments
							};
						});
						cb({
							url: 'http://' + url + '#inlineContent',
							fansubs: fansubs
						});
					} else {
						alert('Failed to get MAL Fansub info. Please make sure you\'re logged into myanimelist.net.');
					}
				},
				onerror: function(err) {
					Util.log('Error loading MAL info.');
				}
			});
		},
		getFansubs: function(id, cb) {
			var self = this;
			if (self.fansubCache[id]) {
				cb(self.fansubCache[id]);
				return;
			}
			self.getHummingbirdInfo(id, function(anime) {
				self.getMALFansubInfo(anime.mal_id, function(fansubs) {
					self.fansubCache[id] = fansubs;
					cb(fansubs);
				});
			});
		},
		getWebsite: function(id, cb) {
			Util.log('Getting website for ' + id);
			var self = this;
			if (self.websiteCache[id]) {
				cb(self.websiteCache[id]);
				return;
			}
			GM_xmlhttpRequest({
				method: 'GET',
				url: 'https://myanimelist.net/fansub-groups.php?id=' + id,
				onload: function(response) {
					var tempDiv = document.createElement('div');
					tempDiv.innerHTML = response.responseText;
					var link = Util.q('td.borderClass > a:first-of-type', tempDiv);
					if (link && link.getAttribute('href')) {
						Util.log('Found website for id');
						self.websiteCache[id] = link.href;
						cb(link.href);
					}
				}
			});
		},
		getFansubDiv: function() {
			var container = document.createElement('div');
			container.classList.add('series-panel');
			container.id = DIV_ID;

			var titleDiv = document.createElement('div');
			titleDiv.classList.add('panel-title', 'has-buttons');
			container.appendChild(titleDiv);

			var title = document.createElement('h4');
			title.textContent = 'Fansubs';
			titleDiv.appendChild(title);

			var btnGroup = document.createElement('div');
			btnGroup.classList.add('btn-group');
			titleDiv.appendChild(btnGroup);

			return container;
		},
		getFansubOutput: function(fansub) {
			var fansubDiv = document.createElement('div');
			fansubDiv.classList.add('franchise-show');

			var name = document.createElement('h4');
			fansubDiv.appendChild(name);

			var nameLink = document.createElement('a');
			nameLink.textContent = fansub.name;
			nameLink.href = fansub.url;
			Util.setNewTab(nameLink);
			name.appendChild(nameLink);

			if (fansub.lang) {
				var lang = document.createElement('small');
				lang.textContent = ' ' + fansub.lang;
				name.appendChild(lang);
			}

			App.getWebsite(fansub.id, function(href) {
				var webLink = document.createElement('a');
				webLink.href = href;
				Util.setNewTab(webLink);
				webLink.classList.add('pull-right');
				webLink.appendChild(Util.icon('link'));
				name.appendChild(webLink);
			});

			var approvals = document.createElement('div');
			approvals.classList.add('review-likes');
			approvals.textContent = fansub.totalApproved + ' of ' + fansub.totalVotes + ' users approve.';
			fansubDiv.appendChild(approvals);

			if (fansub.comments && fansub.comments.length > 0) {
				var commentsLink = document.createElement('a');
				commentsLink.classList.add('pull-right');
				commentsLink.textContent = 'Comments...';
				approvals.appendChild(commentsLink);
				commentsLink.onclick = function(e) {
					e.preventDefault();
					var commentsDiv = document.createElement('div');
					fansub.comments.forEach(function(comment) {
						var div = document.createElement('div');
						div.classList.add('media');

						var smileContainer = document.createElement('div');
						smileContainer.classList.add('quick-rating');
						div.appendChild(smileContainer);
						smileContainer.appendChild(comment.approves ? Util.icon('smile-o') : Util.icon('frown-o'));

						var commentContainer = document.createElement('div');
						commentContainer.classList.add('media-body');
						div.appendChild(commentContainer);
						var commentText = document.createElement('p');
						commentText.textContent = comment.text;
						commentContainer.appendChild(commentText);

						commentsDiv.appendChild(div);
					});
					Util.createModal(fansub.name, commentsDiv);
					return false;
				};
			}

			return fansubDiv;
		},
		filterFansubs: function(fansubs, lang) {
			var langs = lang.split(',').map(function(lang) {
				return lang.trim().toLowerCase();
			});
			return fansubs.filter(function(fansub) {
				var lang = fansub.lang || 'english';
				lang = lang.trim().toLowerCase();
				return langs.includes(lang);
			});
		}
	};

	var cfg = Config.load();
	waitForUrl(REGEX, function() {
		var container = Util.q('.community-column');

		var div = Util.q('#' + DIV_ID);
		if (div) div.remove();
		div = App.getFansubDiv();
		container.appendChild(div);

		var id = location.href.match(REGEX)[1];
		var url = location.href;
		App.getFansubs(id, function(response) {
			if (location.href === url) {
				if (cfg.lang) {
					response.fansubs = App.filterFansubs(response.fansubs, cfg.lang);
				}

				var btnGroup = Util.q('.panel-title > .btn-group', div);
				var malLink = document.createElement('a');
				malLink.href = response.url;
				Util.setNewTab(malLink);
				btnGroup.appendChild(malLink);
				malLink.appendChild(Util.icon('external-link'));

				if (response.fansubs.length > 0) {
					var hiddenSpan = document.createElement('span');
					hiddenSpan.style.display = 'none';
					var addViewMore = false;

					response.fansubs.forEach(function(fansub, i) {
						var fansubDiv = App.getFansubOutput(fansub);
						if (i < 4) {
							div.appendChild(fansubDiv);
						} else {
							hiddenSpan.appendChild(fansubDiv);
							addViewMore = true;
						}
					});

					if (addViewMore) {
						div.appendChild(hiddenSpan);
						var viewMoreDiv = document.createElement('div');
						viewMoreDiv.classList.add('view-more');

						var viewMore = document.createElement('a');
						viewMore.textContent = 'View More Fansubs';
						viewMoreDiv.appendChild(viewMore);

						viewMore.onclick = function(e) {
							e.preventDefault();
							if (hiddenSpan.style.display === 'none') {
								hiddenSpan.style.display = 'inline';
								viewMore.textContent = 'View Less Fansubs';
							} else {
								hiddenSpan.style.display = 'none';
								viewMore.textContent = 'View More Fansubs';
							}
							return false;
						};

						div.appendChild(viewMoreDiv);
					}
				} else {
					var p = document.createElement('p');
					p.textContent = 'No fansubs found.';
					p.style.textAlign = 'center';
					p.style.marginTop = '5px';
					div.appendChild(p);
				}
			}
		});
	});
})();
