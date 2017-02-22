// ==UserScript==
// @name         Kitsu Fansub Info
// @namespace    https://greasyfork.org/users/649
// @version      2.0
// @description  Show MAL fansub info on Kitsu anime pages
// @author       Adrien Pyke
// @match        *://kitsu.io/*
// @match        *://myanimelist.net/anime/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_openInTab
// ==/UserScript==

/*

Evil Icons
https://github.com/evil-icons/evil-icons

Copyright (c) 2014 Alexander Madyankin <alexander@madyankin.name>, Roman Shamin

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function() {
	'use strict';

	var SCRIPT_NAME = 'Kitsu Fansub Info';
	var API = 'https://kitsu.io/api/edge';
	var REGEX = /^https?:\/\/kitsu\.io\/anime\/([^\/]+)\/?(?:\?.*)?$/;
	var SECTION_ID = 'kitsu-fansubs';

	var Icon = {
		extLink: '<path d="M38.288 10.297l1.414 1.415-14.99 14.99-1.414-1.414z"/><path d="M40 20h-2v-8h-8v-2h10z"/><path d="M35 38H15c-1.7 0-3-1.3-3-3V15c0-1.7 1.3-3 3-3h11v2H15c-.6 0-1 .4-1 1v20c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V24h2v11c0 1.7-1.3 3-3 3z"/>',
		link: '<path d="M24 30.2c0 .2.1.5.1.8 0 1.4-.5 2.6-1.5 3.6l-2 2c-1 1-2.2 1.5-3.6 1.5-2.8 0-5.1-2.3-5.1-5.1 0-1.4.5-2.6 1.5-3.6l2-2c1-1 2.2-1.5 3.6-1.5.3 0 .5 0 .8.1l1.5-1.5c-.7-.3-1.5-.4-2.3-.4-1.9 0-3.6.7-4.9 2l-2 2c-1.3 1.3-2 3-2 4.9 0 3.8 3.1 6.9 6.9 6.9 1.9 0 3.6-.7 4.9-2l2-2c1.3-1.3 2-3 2-4.9 0-.8-.1-1.6-.4-2.3L24 30.2z"/><path d="M33 10.1c-1.9 0-3.6.7-4.9 2l-2 2c-1.3 1.3-2 3-2 4.9 0 .8.1 1.6.4 2.3l1.5-1.5c0-.2-.1-.5-.1-.8 0-1.4.5-2.6 1.5-3.6l2-2c1-1 2.2-1.5 3.6-1.5 2.8 0 5.1 2.3 5.1 5.1 0 1.4-.5 2.6-1.5 3.6l-2 2c-1 1-2.2 1.5-3.6 1.5-.3 0-.5 0-.8-.1l-1.5 1.5c.7.3 1.5.4 2.3.4 1.9 0 3.6-.7 4.9-2l2-2c1.3-1.3 2-3 2-4.9 0-3.8-3.1-6.9-6.9-6.9z"/><path d="M20 31c-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l10-10c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-10 10c-.2.2-.4.3-.7.3z"/>',
		minus: '<path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/><path d="M16 24h18v2H16z"/>',
		plus: '<path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/><path d="M16 24h18v2H16z"/><path d="M24 16h2v18h-2z"/>',
		thumbsUp: '<path d="M40 23.2c0-2.1-1.7-3.2-4-3.2h-6.7c.5-1.8.7-3.5.7-5 0-5.8-1.6-7-3-7-.9 0-1.6.1-2.5.6-.3.2-.4.4-.5.7l-1 5.4c-1.1 2.8-3.8 5.3-6 7V36c.8 0 1.6.4 2.6.9 1.1.5 2.2 1.1 3.4 1.1h9.5c2 0 3.5-1.6 3.5-3 0-.3 0-.5-.1-.7 1.2-.5 2.1-1.5 2.1-2.8 0-.6-.1-1.1-.3-1.6.8-.5 1.5-1.4 1.5-2.4 0-.6-.3-1.2-.6-1.7.8-.6 1.4-1.6 1.4-2.6zm-2.1 0c0 1.3-1.3 1.4-1.5 2-.2.7.8.9.8 2.1 0 1.2-1.5 1.2-1.7 1.9-.2.8.5 1 .5 2.2v.2c-.2 1-1.7 1.1-2 1.5-.3.5 0 .7 0 1.8 0 .6-.7 1-1.5 1H23c-.8 0-1.6-.4-2.6-.9-.8-.4-1.6-.8-2.4-1V23.5c2.5-1.9 5.7-4.7 6.9-8.2v-.2l.9-5c.4-.1.7-.1 1.2-.1.2 0 1 1.2 1 5 0 1.5-.3 3.1-.8 5H27c-.6 0-1 .4-1 1s.4 1 1 1h9c1 0 1.9.5 1.9 1.2z"/><path d="M16 38h-6c-1.1 0-2-.9-2-2V22c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2zm-6-16v14h6V22h-6z"/>'
	};

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
		getQueryParameter: function(name, url) {
			if (!url) url = location.href;
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		},
		setQueryParameter: function(key, value, url) {
			if (!url) url = window.location.href;
			var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
				hash;

			if (re.test(url)) {
				if (typeof value !== 'undefined' && value !== null)
					return url.replace(re, '$1' + key + "=" + value + '$2$3');
				else {
					hash = url.split('#');
					url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
					if (typeof hash[1] !== 'undefined' && hash[1] !== null)
						url += '#' + hash[1];
					return url;
				}
			}
			else {
				if (typeof value !== 'undefined' && value !== null) {
					var separator = url.indexOf('?') !== -1 ? '&' : '?';
					hash = url.split('#');
					url = hash[0] + separator + key + '=' + value;
					if (typeof hash[1] !== 'undefined' && hash[1] !== null)
						url += '#' + hash[1];
					return url;
				}
				else
					return url;
			}
		},
		setNewTab: function(node) {
			node.setAttribute('target', '_blank');
			node.setAttribute('rel', 'noopener noreferrer');
		},
		icon: function(name, color, size, scale) {
			var newIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			newIcon.innerHTML = Icon[name];
			newIcon.setAttribute('viewBox', '0 0 50 50');
			newIcon.setAttribute('width', '20');
			newIcon.setAttribute('height', '20');
			if (color) newIcon.setAttribute('fill', color);
			if (size) { newIcon.setAttribute('width', size); newIcon.setAttribute('height', size); }
			if (scale) newIcon.setAttribute('transform', 'scale(' + scale[0] + ', ' + scale[1] + ')');
			return newIcon;
		},
		createModal: function(title, bodyDiv) {
			var div = document.createElement('div');
			var modal = document.createElement('div');
			modal.classList.add('modal');
			modal.style.display = 'block';
			modal.style.overflowY = 'auto';
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
			var wrapper = document.createElement('div');
			wrapper.classList.add('modal-wrapper');
			body.appendChild(wrapper);

			var h4 = document.createElement('h4');
			h4.classList.add('modal-title');
			h4.textContent = title;
			header.appendChild(h4);

			wrapper.appendChild(bodyDiv);

			div.onclick = function(e) {
				if (e.target === modal || e.target === backdrop) {
					div.remove();
				}
			};
			document.body.appendChild(div);
		}
	};

	if (location.hostname === 'kitsu.io') {
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
		GM_registerMenuCommand('Kitsu Fansub Info Settings', Config.setup);

		var App = {
			fansubCache: {},
			websiteCache: {},
			votingTabs: {},
			getKitsuInfo: function(id, cb) {
				Util.log('Loading Kitsu info...');
				GM_xmlhttpRequest({
					method: 'GET',
					url: API + '/anime?filter[slug]=' + id + '&include=mappings',
					headers: {
						'Accept': 'application/vnd.api+json'
					},
					onload: function(response) {
						Util.log('Loaded Kitsu info.');
						cb(JSON.parse(response.responseText));
					},
					onerror: function(err) {
						Util.log('Error loading Kitsu info.');
					}
				});
			},
			getMALFansubInfo: function(malid, cb) {
				Util.log('Loading MAL info...');
				var url = 'https://myanimelist.net/anime/' + malid;
				GM_xmlhttpRequest({
					method: 'GET',
					url: url,
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
								var voteUpButton = Util.q('#good' + id, node);
								var voteDownButton = Util.q('#bad' + id, node);
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
								var value = 3;
								if (voteUpButton.src.match('good\-on\.gif$')) {
									value = 1;
								} else if (voteDownButton.src.match('bad\-on\.gif$')) {
									value = 2;
								}
								return {
									id: id,
									malid: malid,
									name: link.textContent,
									url: 'https://myanimelist.net' + link.pathname + link.search,
									tag: tag,
									lang: lang,
									totalVotes: totalVotes,
									totalApproved: totalApproved,
									value: value,
									comments: comments
								};
							});
							cb({
								url: url + '#inlineContent',
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
				self.getKitsuInfo(id, function(anime) {
					// Todo: Search mapping array properly
					if (anime.included[0].attributes.externalSite == 'myanimelist/anime') {
						var mal_id = anime.included[0].attributes.externalId;
						self.getMALFansubInfo(mal_id, function(fansubs) {
							self.fansubCache[id] = fansubs;
							cb(fansubs);
						});
					}
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
			getFansubSection: function() {
				var container = document.createElement('section');
				container.classList.add('m-b-1');
				container.id = SECTION_ID;

				var title = document.createElement('h5');
				title.id = 'fansubs-title';
				title.textContent = 'Fansubs';
				container.appendChild(title);

				var list = document.createElement('ul');
				list.classList.add('media-list');
				list.classList.add('w-100');
				container.appendChild(list);

				return container;
			},
			vote: function(malid, groupid, value, comment) {
				if (App.votingTabs.malid) {
					App.votingTabs.malid.close();
					App.votingTabs.malid = null;
				}
				var url = 'https://myanimelist.net/anime/' + malid;
				url = Util.setQueryParameter('US_VOTE', true, url);
				url = Util.setQueryParameter('groupid', groupid, url);
				url = Util.setQueryParameter('value', value, url);
				url = Util.setQueryParameter('comment', comment, url);
				App.votingTabs.malid = GM_openInTab(url, true);
				App.votingTabs.malid.onbeforeunload = function(e) {
					App.votingTabs.malid = null;
				};
			},
			getFansubOutput: function(fansub) {
				var fansubDiv = document.createElement('div');
				fansubDiv.classList.add('stream-item');
				fansubDiv.classList.add('row');

				var streamWrap = document.createElement('div');
				streamWrap.classList.add('stream-item-wrapper');
				streamWrap.classList.add('stream-review-wrapper');
				streamWrap.classList.add('col-sm-12');
				fansubDiv.appendChild(streamWrap);

				var streamReview = document.createElement('div');
				streamReview.classList.add('stream-review');
				streamReview.classList.add('row');
				streamWrap.appendChild(streamReview);

				var streamActivity = document.createElement('div');
				streamActivity.classList.add('stream-item-activity');
				streamWrap.appendChild(streamActivity);

				var streamOptions = document.createElement('div');
				streamOptions.classList.add('stream-item-options');
				streamWrap.appendChild(streamOptions);

				var streamContent = document.createElement('div');
				streamContent.classList.add('stream-review-content');
				streamReview.appendChild(streamContent);

				var heading = document.createElement('small');
				heading.classList.add('media-heading');
				streamContent.appendChild(heading);

				var name = document.createElement('h6');
				heading.appendChild(name);

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
					webLink.appendChild(document.createTextNode(' '));
					webLink.appendChild(Util.icon('link')).setAttribute('style', 'vertical-align: sub');
					name.appendChild(webLink);
				});

				var votingButtons = document.createElement('div');
				votingButtons.classList.add('like-stream-item');
				var voteUp = document.createElement('a');
				var voteDown = document.createElement('a');
				votingButtons.appendChild(voteUp);
				votingButtons.appendChild(document.createTextNode(' '));
				votingButtons.appendChild(voteDown);
				streamActivity.appendChild(votingButtons);
				voteUp.href = '#';
				voteDown.href = '#';
				voteUp.dataset.value = 1;
				voteDown.dataset.value = 2;

				if (fansub.value === 1) {
					voteUp.appendChild(Util.icon('thumbsUp', '#16A085'));
					voteDown.appendChild(Util.icon('thumbsUp', '', '', [-1, -1]));
				} else if (fansub.value === 2) {
					voteUp.appendChild(Util.icon('thumbsUp', ''));
					voteDown.appendChild(Util.icon('thumbsUp','#DB2409', '', [-1, -1]));
				} else {
					voteUp.appendChild(Util.icon('thumbsUp', ''));
					voteDown.appendChild(Util.icon('thumbsUp', '', '', [-1, -1]));
				}

				var voteHandler = function(e) {
					e.preventDefault();
					var clickedNode = e.target;
					if (clickedNode.nodeName === 'I') {
						clickedNode = clickedNode.parentNode;
					}
					var value = parseInt(clickedNode.dataset.value);
					if (value === fansub.value) {
						value = 3;
					}
					App.vote(fansub.malid, fansub.id, value);
					fansub.value = value;
					voteUp.innerHTML = voteDown.innerHTML = '';

					if (fansub.value === 1) {
						voteUp.appendChild(Util.icon('thumbsUp', '#16A085'));
						voteDown.appendChild(Util.icon('thumbsUp', '', '', [-1, -1]));
					} else if (fansub.value === 2) {
						voteUp.appendChild(Util.icon('thumbsUp', ''));
						voteDown.appendChild(Util.icon('thumbsUp','#DB2409', '', [-1, -1]));
					} else {
						voteUp.appendChild(Util.icon('thumbsUp', ''));
						voteDown.appendChild(Util.icon('thumbsUp', '', '', [-1, -1]));
					}
				};
				voteUp.onclick = voteHandler;
				voteDown.onclick = voteHandler;

				var approvals = document.createElement('div');
				approvals.classList.add('comment-body');
				approvals.textContent = fansub.totalApproved + ' of ' + fansub.totalVotes + ' users approve.';
				streamContent.appendChild(approvals);

				if (fansub.comments && fansub.comments.length > 0) {
					var commentsWrap = document.createElement('span');
					commentsWrap.classList.add('more-wrapper');
					streamOptions.appendChild(commentsWrap);
					var commentsLink = document.createElement('a');
					commentsLink.classList.add('more-drop');
					commentsLink.href = '#';
					commentsLink.textContent = 'Comments...';
					commentsWrap.appendChild(commentsLink);
					commentsLink.onclick = function(e) {
						e.preventDefault();
						var commentsDiv = document.createElement('div');
						fansub.comments.forEach(function(comment) {
							var div = document.createElement('div');
							div.classList.add('author-header');

							var smileContainer = document.createElement('div');
							smileContainer.classList.add('review-avatar');
							smileContainer.setAttribute('style', 'margin-right: 0');
							div.appendChild(smileContainer);
							smileContainer.appendChild(comment.approves ? Util.icon('plus', '#16A085', 25) : Util.icon('minus', '#DB2409', 25));

							var commentContainer = document.createElement('div');
							commentContainer.classList.add('comment-body');
							commentContainer.setAttribute('style', 'margin-left: 40px');
							div.appendChild(commentContainer);
							var commentText = document.createElement('p');
							commentText.textContent = comment.text;
							commentContainer.appendChild(commentText);

							commentsDiv.appendChild(div);
						});
						Util.q('.author-header:last-child', commentsDiv).setAttribute('style', 'border-bottom: none;');
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
			waitForElems({
				sel: '.media-container > .row > .col-sm-8',
				stop: true,
				onmatch: function(container) {
					var reviews = Util.qq('section.m-b-1', container)[1];

					var section = Util.q('#' + SECTION_ID, container);
					if (section) section.remove();
					section = App.getFansubSection();
					reviews.parentNode.insertBefore(section, reviews.nextSibling);

					var slug = location.href.match(REGEX)[1];
					var url = location.href;
					App.getFansubs(slug, function(response) {
						if (location.href === url) {
							if (cfg.lang) {
								response.fansubs = App.filterFansubs(response.fansubs, cfg.lang);
							}

							var extLink = Util.q('h5#fansubs-title', section);
							var malLink = document.createElement('a');
							malLink.href = response.url;
							Util.setNewTab(malLink);
							extLink.appendChild(malLink);
							malLink.appendChild(Util.icon('extLink')).setAttribute('style', 'vertical-align: sub');

							var list = Util.q('.media-list', section);

							if (response.fansubs.length > 0) {
								var hiddenSpan = document.createElement('span');
								hiddenSpan.style.display = 'none';
								var addViewMore = false;

								response.fansubs.forEach(function(fansub, i) {
									var fansubDiv = App.getFansubOutput(fansub);
									if (i < 4) {
										list.appendChild(fansubDiv);
									} else {
										hiddenSpan.appendChild(fansubDiv);
										addViewMore = true;
									}
								});

								if (addViewMore) {
									list.appendChild(hiddenSpan);
									var viewMoreDiv = document.createElement('div');
									viewMoreDiv.classList.add('text-xs-center');
									viewMoreDiv.classList.add('w-100');

									var viewMore = document.createElement('a');
									viewMore.classList.add('button');
									viewMore.classList.add('button--secondary');
									viewMore.setAttribute('style', 'color: #FFF;');
									viewMore.href = '#';
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

									list.appendChild(viewMoreDiv);
								}
							} else {
								var p = document.createElement('p');
								p.textContent = 'No fansubs found.';
								p.style.textAlign = 'center';
								p.style.marginTop = '5px';
								list.appendChild(p);
							}
						}
					});
				}
			});
		});
	} else if (Util.getQueryParameter('US_VOTE')) {
		var groupid = Util.getQueryParameter('groupid');
		var value = Util.getQueryParameter('value');
		var comment = Util.getQueryParameter('comment');
		var button = Util.q('.js-fansub-set-vote-button[data-type="' + value +'"][data-group-id="' + groupid + '"]');
		button.click();
		if (value === '3') {
			setTimeout(window.close, 0);
		} else {
			waitForElems({
				sel: '#fancybox-inner',
				stop: true,
				onmatch: function(node) {
					var commentBox = Util.q('#fsgcomm', node);
					var submit = Util.q('.js-fansub-comment-button', node);
					commentBox.value = comment;
					setTimeout(function() {
						Util.log(submit);
						submit.click();
						setTimeout(window.close, 0);
					}, 300);
				}
			});
		}
	}
})();
