// ==UserScript==
// @name         View More Videos by Same YouTube Channel
// @namespace    https://greasyfork.org/users/649
// @version      1.0.7
// @description  Displays a list of more videos by the same channel inline
// @author       Adrien Pyke
// @match        *://www.youtube.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @require      https://unpkg.com/mithril
// @resource     pageTokens https://cdn.rawgit.com/Quihico/handy.stuff/7e47f4f2/yt.pagetokens.00000-00999
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(() => {
	'use strict';

	const CLASS_PREFIX = 'YVM_';

	GM_addStyle(`
		.${CLASS_PREFIX}slider {
			display: flex;
			align-items: center;
			margin-top: 8px;
		}
		.${CLASS_PREFIX}thumbnails-wrap {
			flex-grow: 1;
			overflow-x: hidden;
		}
		.${CLASS_PREFIX}thumbnails {
			display: flex;
			position: relative;
			top: 0;
			transition: left 300ms ease-out;
		}
		.${CLASS_PREFIX}thumbnail {
			display: flex;
			flex-direction: column;
			margin-right: 8px;
			min-width: 168px;
		}
		.${CLASS_PREFIX}thumbnail.${CLASS_PREFIX}active {
			background-color: hsl(0, 0%, 93.3%);
		}
		#${CLASS_PREFIX}mount-point {
			margin-top: 8px;
		}
		.${CLASS_PREFIX}slider ytd-thumbnail.ytd-compact-video-renderer {
			margin: 0;
		}
		.${CLASS_PREFIX}slider #video-title.ytd-compact-video-renderer {
			max-height: 4.8rem;
		}
	`);

	const API_URL = 'https://www.googleapis.com/youtube/v3/';
	const API_KEY = 'AIzaSyCR7JKF4Lb-CsTQNapToOQeMF7SIIbqxSw';
	const RESULTS_PER_FETCH = 50;
	const LAZY_LOAD_BUFFER = 10;

	const Util = {
		btn(options, text) {
			return m('paper-button[role=button][subscribed].style-scope.ytd-subscribe-button-renderer', options, text);
		},
		iconBtn(icon, options = {}) {
			return m('ytd-button-renderer.style-scope.ytd-menu-renderer.force-icon-button.style-default.size-default[button-renderer][is-icon-button]', [
				m('paper-icon-button', Object.assign(options, { icon }))
			]);
		},
		initCmp(cmp) {
			const oninit = cmp.oninit;
			return Object.assign({}, cmp, {
				oninit(vnode) {
					if (typeof cmp.model === 'function') vnode.state.model = cmp.model();
					if (oninit) oninit(vnode);
				}
			});
		},
		delayedRedraw(func, delay = 50) {
			return new Promise(resolve => setTimeout(() => {
				func();
				m.redraw();
				resolve();
			}, delay));
		}
	};

	const Api = {
		pageTokens: GM_getResourceText('pageTokens').split('\n'),
		request(endpoint, data, method = 'GET') {
			return m.request({
				method,
				background: true,
				url: API_URL + endpoint,
				data: Object.assign(data, { key: API_KEY })
			});
		},
		parseVideo(data) {
			return {
				id: data.id.videoId || data.id,
				title: data.snippet.title,
				channelId: data.snippet.channelId,
				channelTitle: data.snippet.channelTitle,
				publishedAt: data.snippet.publishedAt,
				thumbnail: data.snippet.thumbnails.medium.url
			};
		},
		async getVideo(id) {
			const data = await Api.request('videos', {
				part: 'snippet',
				id
			});
			if (data && data.items.length > 0) return Api.parseVideo(data.items[0]);
		},
		performSearch(currentVideo, options, pageToken) {
			return Api.request('search', Object.assign({
				part: 'snippet',
				type: 'video',
				channelId: currentVideo.channelId,
				order: 'date',
				maxResults: RESULTS_PER_FETCH
			}, pageToken ? { pageToken } : {}, options));
		},
		async getNumNewerVideos(currentVideo) {
			const data = await Api.performSearch(currentVideo, {
				publishedAfter: currentVideo.publishedAt,
				maxResults: 1
			});
			return Math.max(0, Math.min(data.pageInfo.totalResults - 1, 500));
		},
		async getOlderVideos(currentVideo, pageToken) {
			const data = await Api.performSearch(currentVideo, {
				publishedBefore: currentVideo.publishedAt
			}, pageToken);
			return {
				pageToken: data.nextPageToken,
				videos: data.items.map(Api.parseVideo)
			};
		},
		async getNewerVideos(currentVideo, pageToken) {
			const data = await Api.performSearch(currentVideo, {
				publishedAfter: currentVideo.publishedAt
			}, pageToken);
			return {
				pageToken: data.prevPageToken,
				videos: data.items.map(Api.parseVideo).filter(video => video.id !== currentVideo.id).reverse()
			};
		},
		get currentVideoId() {
			const url = new URL(location.href);
			return url.searchParams.get('v');
		}
	};

	const Components = {
		App: Util.initCmp({
			model: () => ({
				hidden: true
			}),
			actions: {
				toggle: model => model.hidden = !model.hidden
			},
			view(vnode) {
				const { model, actions } = vnode.state;
				return m('div', [
					Util.btn({
						onclick: () => actions.toggle(model)
					}, 'View More Videos'),
					m(Components.Slider, { hidden: model.hidden, videoId: Api.currentVideoId })
				]);
			}
		}),
		Slider: Util.initCmp({
			model: () => ({
				currentVideo: null,
				olderVideos: [],
				loading: false,
				olderPageToken: null,
				newerVideos: [],
				newerPageToken: null,
				position: 0,
				shiftLeft() {
					this.position = Math.max(this.position - 1, -this.newerVideos.length);
				},
				shiftRight() {
					this.position = Math.min(this.position + 1, this.olderVideos.length - 1);
				},
				get leftpx() {
					return (this.newerVideos.length * -176) - (this.position * 176);
				}
			}),
			actions: {
				async fetchInitialVideos(model, currentVideoId) {
					model.currentVideo = await Api.getVideo(currentVideoId);
					const numNewerVideos = await Api.getNumNewerVideos(model.currentVideo);
					this.loadOlder(model);
					if (numNewerVideos > 0) {
						const numOnLastPage = numNewerVideos % RESULTS_PER_FETCH;
						const page = numNewerVideos - numOnLastPage;
						if (page > 0) model.newerPageToken = Api.pageTokens[page];
						this.loadNewer(model);
						model.position = -1;
					}
					m.redraw();
				},
				async loadOlder(model, keepLoading = false) {
					model.loading = true;

					const results = await Api.getOlderVideos(model.currentVideo, model.olderPageToken);
					model.olderVideos.push(...results.videos);
					model.olderPageToken = results.pageToken;

					if (!keepLoading) model.loading = false;
					m.redraw();
				},
				async loadNewer(model, keepLoading = false) {
					model.loading = true;

					let results;
					let timesTried = 0;
					// dumb workaround for page token sometimes being incorrect
					do {
						results = await Api.getNewerVideos(model.currentVideo, model.newerPageToken);
						model.newerPageToken = results.pageToken;
						timesTried++;
					} while (!results.videos.length && results.pageToken && timesTried < 5);

					model.newerVideos.unshift(...results.videos.reverse());

					if (!keepLoading) model.loading = false;
					m.redraw();
				},
				async moveLeft(model) {
					if (model.loading) return;
					if (Math.abs(model.position - LAZY_LOAD_BUFFER) > model.newerVideos.length && model.newerPageToken) {
						await this.loadNewer(model, true);
						Util.delayedRedraw(() => {
							model.shiftLeft();
							model.loading = false;
						});
					} else {
						model.shiftLeft();
					}
				},
				async moveRight(model) {
					if (model.loading) return;
					if (model.position + LAZY_LOAD_BUFFER > model.olderVideos.length && model.olderPageToken) {
						await this.loadOlder(model, true);
						Util.delayedRedraw(() => {
							model.shiftRight();
							model.loading = false;
						});
					} else {
						model.shiftRight();
					}
				}
			},
			oninit(vnode) {
				const { model, actions } = vnode.state;
				actions.fetchInitialVideos(model, vnode.attrs.videoId);
			},
			view(vnode) {
				const { model, actions } = vnode.state;
				return m(`div.${CLASS_PREFIX}slider`, { hidden: vnode.attrs.hidden }, [
					Util.iconBtn('chevron-left', { onclick: () => actions.moveLeft(model) }),
					m(`div.${CLASS_PREFIX}thumbnails-wrap`, [
						m(`div.${CLASS_PREFIX}thumbnails`, {
							style: `left: ${model.leftpx}px;transition-property:${model.loading ? 'none' : ''};`
						}, model.newerVideos.concat(model.olderVideos).map(video => {
							return m(Components.Thumbnail, {
								key: video.id,
								active: video.id === model.currentVideo.id,
								video
							});
						}))
					]),
					Util.iconBtn('chevron-right', { onclick: () => actions.moveRight(model) })
				]);
			}
		}),
		Thumbnail: Util.initCmp({
			model: () => ({
				video: null
			}),
			oninit(vnode) {
				vnode.state.model.video = vnode.attrs.video;
			},
			view(vnode) {
				const { model } = vnode.state;
				return m(`div.${CLASS_PREFIX}thumbnail${vnode.attrs.active ? `.${CLASS_PREFIX}active` : ''}`, [
					m('ytd-thumbnail.style-scope.ytd-compact-video-renderer', { width: 168 }, [
						m('a#thumbnail.yt-simple-endpoint.inline-block.style-scope.ytd-thumbnail', { rel: 'nofollow', href: `/watch?v=${model.video.id}` }, [
							m('yt-img-shadow.style-scope.ytd-thumbnail.no-transition[loaded]', [
								m('img.style-scope.yt-img-shadow', { width: 168, src: model.video.thumbnail })
							])
						])
					]),
					m('a.yt-simple-endpoint.style-scope.ytd-compact-video-renderer', { rel: 'nofollow', href: `/watch?v=${model.video.id}` }, [
						m('h3.style-scope.ytd-compact-video-renderer', [
							m('span#video-title.style-scope.ytd-compact-video-renderer', { title: model.video.title }, model.video.title)
						])
					])
				]);
			}
		})
	};

	let wait;
	const mountId = `${CLASS_PREFIX}mount-point`;
	waitForUrl(() => true, () => {
		if (wait) wait.stop();
		const oldMount = document.getElementById(mountId);
		if (oldMount) {
			m.mount(oldMount, null);
			oldMount.remove();
		}
		wait = waitForElems({
			sel: 'ytd-video-secondary-info-renderer #container',
			stop: true,
			onmatch(container) {
				const mount = document.createElement('div');
				mount.id = mountId;
				container.prepend(mount);
				m.mount(mount, Components.App);
			}
		});
	});
})();
