var LfmLovedLogin = function() {};
LfmLogin.extendTo(LfmLovedLogin, {
	init: function(opts) {
		this._super(opts);
		this.setRequestDesc(localize('grant-love-lfm-access'));
	},
	beforeRequest: function() {
		this.bindAuthCallback();
		
	},
	bindAuthCallback: function(){
		var _this = this;
		this.auth.once("session.input_click", function() {
			_this.pmd.loadPlStart();
			_this.pmd.showPlPage();
		}, {exlusive: true});
	}
});


var LfmReccomsLogin = function(){};
LfmLogin.extendTo(LfmReccomsLogin, {
	init: function(opts){
		this._super(opts);
		this.setRequestDesc(localize('lastfm-reccoms-access'));
	},
	beforeRequest: function() {
		this.bindAuthCallback();
		
	},
	bindAuthCallback: function(){
		var _this = this;
		this.auth.once("session.input_click", function() {
			_this.pmd.loadPlStart();
			_this.pmd.showPlPage();
		}, {exlusive: true});
	}
});
var VkAudioLogin = function() {};
VkLoginB.extendTo(VkAudioLogin, {
	init: function(opts) {
		this._super(opts,  {
			open_opts: {settings_bits: 8},
			desc: localize('to-play-vk-audio')
		});
	},
	beforeRequest: function() {
		var _this = this;
		this.bindAuthReady('input_click', function() {
			_this.pmd.loadPlStart();
			_this.pmd.showPlPage();
		});
		
	}
});

var EnhancedSongslist = function() {};
songsList.extendTo(EnhancedSongslist, {
	
	showPlPage: function() {
		this.app.show_playlist_page(this, {
			page_md: this.pmd,
			source_md: this
		});
	},
	switchPmd: function(toggle) {
		var new_state;
		if (typeof toggle == 'boolean')	{
			new_state = toggle;
		} else {
			new_state = !this.state('pmd-vswitched');
		}
		if (new_state){
			if (!this.state('pmd-vswitched')){
				this.pmd.updateState('vswitched', this.provoda_id);
			}
		} else {
			if (this.state('pmd-vswitched')){
				this.pmd.updateState('vswitched', false);
			}
		}
		
		
	},
	loadPlStart: function() {
		if (this.state('has-access')){
			this._super.apply(this, arguments);
		}
	},

	authSwitching: function(auth, AuthConstr, params) {
		var auth_rqb = new AuthConstr();
		auth_rqb.init({auth: auth, pmd: this}, params);
		this.updateState('has-access', auth_rqb.state('has-session'));
		auth_rqb.on('state-change.has-session', function() {
			_this.updateState('has-access', true);
			_this.switchPmd(false);
		});

		this.setChild('auth_part', auth_rqb);

		var _this = this;

		this.pmd.on('state-change.vswitched', function(e) {
			_this.checkPMDSwiched(e.value);
		});

	},
	checkPMDSwiched: function(value) {
		this.updateState('pmd-vswitched', value == this.provoda_id);
	},
	requestPlaylist: function() {
		if (this.state('has-access')){
			this.loadPlStart();
			this.showPlPage();
		} else {
			this.switchPmd();
		}
	}
});


var LfmLovedList = function() {};
EnhancedSongslist.extendTo(LfmLovedList, {
	init: function(opts, username) {
		this._super(opts);
		this.setBaseInfo({
			title: localize('loved-tracks'),
			type: 'artists by loved'
		});
		this.updateState('url-part', '/loved');
		if (username){
			this.username = username;
			this.updateState('has-access', true);
		} else {
			this.permanent_md = true;
			this.authSwitching(this.app.lfm_auth, LfmLovedLogin);
		}
	},
	requestMoreSongs: function(paging_opts) {
		var _this = this;
		var request_info = {};
		request_info.request = lfm.get('user.getLovedTracks', {
			user: (this.username || lfm.user_name),
			limit: paging_opts.page_limit,
			page: paging_opts.next_page
		}, {nocache: true})
			.done(function(r){
				var tracks = toRealArray(getTargetField(r, 'lovedtracks.track'));
				var track_list = [];
				if (tracks) {
					for (var i=paging_opts.remainder, l = Math.min(tracks.length, paging_opts.page_limit); i < l; i++) {
						track_list.push({
							'artist' : tracks[i].artist.name,
							'track': tracks[i].name,
							lfm_image:  {
								array: tracks[i].image
							}
						});
					}
				}
				if (track_list.length < paging_opts.page_limit){
					_this.setLoaderFinish();
				}

				_this.injectExpectedSongs(track_list);

			})
			.fail(function() {
				_this.loadComplete(true);
			})
			.always(function() {
				request_info.done = true;
			});

		return request_info;
	}
});

var MyVkAudioList = function() {};
EnhancedSongslist.extendTo(MyVkAudioList, {
	init: function(opts, user_id) {
		this._super(opts);

		this.user_id = user_id;

		if (!user_id){
			this.permanent_md = true;
		}
		this.setBaseInfo({
			title: localize('vk-audio'),
			type: 'vk-audio'
		});

		this.updateState('url-part', '/vk-audio');
		
		this.authSwitching(this.app.vk_auth, VkAudioLogin);
	},
	requestMoreSongs: function(paging_opts) {
		
		var request_info = {};
		var _this = this;

		request_info.request = this.app.vk_api.get('audio.get', {
			sk: lfm.sk,
			count: paging_opts.page_limit,
			offset: (paging_opts.next_page - 1) * paging_opts.page_limit
		}, {nocache: true})
			.done(function(r){
				var vk_search = _this.app.mp3_search.getSearchByName('vk');
			
				var track_list = [];

				for (var i = 0; i < r.response.length; i++) {
					var cur = r.response[i];
					track_list.push({
						artist: cur.artist,
						track: cur.title,
						file: vk_search.makeSongFile(cur)
					});
					
				}

				_this.injectExpectedSongs(track_list);

				if (track_list.length < paging_opts.page_limit){
					_this.setLoaderFinish();
				}
			})
			.fail(function(){
				_this.loadComplete(true);
			}).always(function() {
				request_info.done = true;
			});
		return request_info;
	}
});

var artistsRecommsList = function() {};
EnhancedSongslist.extendTo(artistsRecommsList, {
	init: function(opts, username) {
		this._super(opts);

		this.setBaseInfo({
			title: username ? (localize('reccoms-for') + username) : localize('reccoms-for-you'),
			type: 'artists by recommendations'
		});
		this.updateState('url-part', '/recommendations');
		
		this.authSwitching(this.app.lfm_auth, LfmReccomsLogin);
		
		var _this = this;
		if (!username){
			this.permanent_md = true;
		}

		if (username){
			if (this.app.env.cross_domain_allowed){
				_this.setLoader(this.loadMoreByRSS);
			}
		} else {
			_this.setLoader(this.loadMoreByAPI);
			
		}
	},
	loadMoreByAPI: function(paging_opts) {
		var _this = this;
		var request_info = {};

		request_info.request = lfm.get('user.getRecommendedArtists', {
			sk: lfm.sk,
			limit: paging_opts.page_limit,
			page: paging_opts.next_page
		}, {nocache: true})
			.done(function(r){
				var artists = toRealArray(getTargetField(r, 'recommendations.artist'));
				var track_list = [];
				if (artists && artists.length) {
					
					for (var i=0, l = Math.min(artists.length, paging_opts.page_limit); i < l; i++) {
						track_list.push({
							artist: artists[i].name,
							lfm_image: {
								array: artists[i].image
							}
						});
					}
				}
				_this.injectExpectedSongs(track_list);

				if (track_list.length < paging_opts.page_limit){
					_this.setLoaderFinish();
				}
			})
			.fail(function(){
				_this.loadComplete(true);
			}).always(function() {
				request_info.done = true;
			});
		return request_info;
	},
	loadMoreByRSS: function() {
		var _this = this;
		var request_info = {};
		request_info.request = $.ajax({
			url: 'http://ws.audioscrobbler.com/1.0/user/' + username + '/systemrecs.rss',
			type: "GET",
			dataType: "xml"
		})
			.done(function(xml) {
				var artists = $(xml).find('channel item title');
				if (artists && artists.length) {
					var track_list_without_tracks = [];
					for (var i=0, l = (artists.length < 30) ? artists.length : 30; i < l; i++) {
						var artist = $(artists[i]).text();
						track_list_without_tracks.push({
							artist: artist
						});
					}
					_this.injectExpectedSongs(track_list_without_tracks);
					_this.setLoaderFinish();
				}
			})
			.fail(function() {
				_this.loadComplete(true);
			})
			.always(function() {
				request_info.done = true;
			});
		return request_info;
	}
	
});


var UsersList = function() {};
mapLevelModel.extendTo(UsersList, {
	
});


var UserCard = function() {};

mapLevelModel.extendTo(UserCard, {
	model_name: 'usercard',
	init: function(opts, params) {
		this._super.apply(this, arguments);
		this.app = opts.app;

		//this.
		//new
		this.for_current_user = params.for_current_user;
		if (this.for_current_user){
			this.permanent_md = true;
		}

		var _this = this;

		var postInit = function() {

			this.arts_recomms = new artistsRecommsList();
			this.arts_recomms.init({pmd: this, app: this.app});
			this.setChild('arts_recomms', this.arts_recomms);


			this.lfm_loved = new LfmLovedList();
			this.lfm_loved.init({pmd: this, app: this.app});
			this.setChild('lfm_loved', this.lfm_loved);

			this.my_vkaudio = new MyVkAudioList();
			this.my_vkaudio.init({pmd: this, app: this.app});
			this.setChild('vk_audio', this.my_vkaudio);
		};
		jsLoadComplete({
			test: function() {
				return _this.app.p && _this.app.mp3_search;
			},
			fn: function() {
				postInit.call(_this);
			}
		});
		jsLoadComplete({
			test: function() {
				return _this.app && _this.app.gena;
			},
			fn: function() {
				(function(){
					

					var hasPlaylistCheck = function(items) {
						_this.updateState('has-playlists', !!items.length);
					};
					hasPlaylistCheck(this.app.gena.playlists);
					
					this.app.gena.on('playlsits-change', hasPlaylistCheck);


				}).call(_this);
			}
		});
		this.updateState('url-part', '/users/' + (this.for_current_user ? 'me' : params.username));

		this.updateState('nav-title', 'Персональная музыка, друзья и знакомства');
		/*

		аудиозаписи

		рекомендации артистов, альбомов, любимые

		последнее
		библиотека */

		return this;
	},
	'stch-mp-show': function(state) {
		if (state && state.userwant){
			var list_to_preload = [
				this.getChild('arts_recomms'),
				this.getChild('lfm_loved'),
				this.getChild('vk_audio')
			];
			for (var i = 0; i < list_to_preload.length; i++) {
				var cur = list_to_preload[i];
				if (cur){
					cur.preloadStart();
				}
			}

			
		}
	}
});