define(['provoda', 'spv', 'app_serv', './comd','./SongsList', 'js/common-libs/htmlencoding', 'js/libs/BrowseMap', './LoadableList'],
function(provoda, spv, app_serv, comd, SongsList, htmlencoding, BrowseMap, LoadableList){
'use strict';
var localize = app_serv.localize;

var VkAudioLogin = function() {};
comd.VkLoginB.extendTo(VkAudioLogin, {
	init: function(opts) {
		this._super(opts,  {
			open_opts: {settings_bits: 8},
			desc: localize('to-play-vk-audio')
		});
	},
	beforeRequest: function() {
		var _this = this;
		this.bindAuthReady('input_click', function() {
			_this.pmd.loadStart();
			_this.pmd.showOnMap();
		});
	}
});

var VkSongList = function() {};
SongsList.extendTo(VkSongList, {
	'compx-has_no_access': {
		depends_on: ['has_no_auth'],
		fn: function(no_auth) {
			return no_auth;
		}
	},
	init: function(opts, params) {
		this._super(opts);

		var user_id = params.vk_userid;
		this.sub_pa_params = {
			vk_userid: params.vk_userid,
			for_current_user: params.for_current_user
		};

		this.user_id = user_id;

		this.initStates();
		this.authInit();
		this.authSwitching(this.app.vk_auth, VkAudioLogin);
	}
});

var VkRecommendedTracks = function() {};
VkSongList.extendTo(VkRecommendedTracks, {
	sendMoreDataRequest: function(paging_opts) {
		var request_info = {};
		var _this = this;

		request_info.request = this.app.vk_api.get('audio.getRecommendations', {
			count: paging_opts.page_limit,
			offset: (paging_opts.next_page - 1) * paging_opts.page_limit
		})
			.done(function(r){
				if (!r || r.error){
					_this.requestComplete(request_info.request, true);
					return;
				}
				var vk_search = _this.app.mp3_search.getSearchByName('vk');
				var track_list = [];

				for (var i = 0; i < r.response.length; i++) {
					var cur = r.response[i];
					track_list.push({
						artist: htmlencoding.decode(cur.artist),
						track: htmlencoding.decode(cur.title),
						file: vk_search.makeSongFile(cur)
					});
				}

				_this.putRequestedData(request_info.request, track_list, r.error);

			})
			.fail(function(){
				_this.requestComplete(request_info.request, true);
			}).always(function() {
				request_info.done = true;
			});
		return request_info;
	}
});

var MyVkAudioList = function() {};
VkSongList.extendTo(MyVkAudioList, {
	sendMoreDataRequest: function(paging_opts) {
		var request_info = {};
		var _this = this;

		request_info.request = this.app.vk_api.get('audio.get', {
			count: paging_opts.page_limit,
			offset: (paging_opts.next_page - 1) * paging_opts.page_limit
		})
			.done(function(r){
				if (!r || r.error){
					_this.requestComplete(request_info.request, true);
					return;
				}
				var vk_search = _this.app.mp3_search.getSearchByName('vk');
				var track_list = [];

				for (var i = 0; i < r.response.length; i++) {
					var cur = r.response[i];
					track_list.push({
						artist: htmlencoding.decode(cur.artist),
						track: htmlencoding.decode(cur.title),
						file: vk_search.makeSongFile(cur)
					});
				}
				_this.putRequestedData(request_info.request, track_list, r.error);
			})
			.fail(function(){
				_this.requestComplete(request_info.request, true);
			}).always(function() {
				request_info.done = true;
			});
		return request_info;
	}
});

var VkUserTracks = function() {};
BrowseMap.Model.extendTo(VkUserTracks, {
	model_name: 'listoflists',
	init: function(opts, params) {
		this._super(opts);
		this.sub_pa_params = {
			vk_userid: params.vk_userid,
			for_current_user: params.for_current_user
		};
		this.initStates();
		this.initListedModels(['my', 'recommended']);
	},
	sub_pa: {
		'my': {
			constr: MyVkAudioList,
			getTitle: function() {
				return localize('vk-audio');
			}
		},
		'recommended':{
			constr: VkRecommendedTracks,
			title: "Recommended"
		}
	}
});


var VkUserPreview = function() {};
BrowseMap.Model.extendTo(VkUserPreview, {
	init_stmp: {
		userid: 'uid',
		first_name: 'first_name',
		last_name: 'last_name',
		photo: 'photo',
		'selected_image.url': 'photo'
	},
	'compx-big_desc': {
		depends_on: ['nav_title'],
		fn: function(nav_title){
			return nav_title;
		}
	},
	'compx-nav_title': {
		depends_on: ['first_name', 'last_name'],
		fn: function(first_name, last_name){
			return [first_name, last_name].join(' ');
		}
	},
	init: function(opts, params) {
		this._super(opts);
		var data = params.data;
		this.mapStates(this.init_stmp, data, true);
		this.initStates();
		this.rawdata = data;
	},
	showOnMap: function() {
		var md = this.app.getVkUser(this.state('userid'));
		md.setProfileData(this.rawdata);
		md.showOnMap();
		//this.app.showLastfmUser(this.state('userid'));
		//this.app.
	}

});

var no_access_compx = {
	depends_on: ['userid'],
	fn: function(userid) {
		return !userid;
	}
};

var connectUserid = function(params) {
	var _this = this;
	if (params.vk_userid){
		this.updateState('userid', params.vk_userid);
	} else {
		if (params.for_current_user){
			this.updateState('userid', false);
			this.app.on('state-change.vk_userid', function(e) {
				_this.updateState('userid', e.value);
			});
			if (this.authInit){
				this.authInit();
			}
			if (this.authSwitching){
				//this.authSwitching(this.app.lfm_auth, UserCardLFMLogin, {desc: this.access_desc});
			}
			
		} else {
			throw new Error('only for current user or defined user');
		}
	}

	/*
	*/
};

var VKFriendsList = function(){};
LoadableList.extendTo(VKFriendsList, {
	'compx-has_no_access': no_access_compx,
	init: function(opts, params) {
		this._super(opts);
		connectUserid.call(this, params);
		this.sub_pa_params = {
			vk_userid: params.vk_userid,
			for_current_user: params.for_current_user
		};
		this.initStates();
	},
	friendsParser: function(r, field_name) {
		var result = [];
		var array = spv.toRealArray(spv.getTargetField(r, field_name));
		for (var i = 0; i < array.length; i++) {
			var cur = array[i];
			result.push(cur);
		}
		return result;
	},
	itemConstr: VkUserPreview,
	makeDataItem:function(data) {
		var item = new this.itemConstr();
		item.init({
			map_parent: this,
			app: this.app
		}, spv.cloneObj({
			data: data
		}, this.sub_pa_params));
		return item;
	},
	main_list_name: 'list_items',
	model_name: 'vk_users',
	page_limit: 200,
	getRqData: function() {
		return {
			recenttracks: true,
			user: this.state('userid')
		};
	},
	sendMoreDataRequest: function(paging_opts, request_info) {
		var _this = this;

		request_info.request = this.app.vk_api.get('friends.get', {
			uid: this.state('userid'),
			fields: ['uid', 'first_name', 'last_name', 'sex', 'photo', 'photo_medium', 'photo_big'].join(','),
			count: paging_opts.page_limit,
			offset: (paging_opts.next_page - 1) * paging_opts.page_limit
		})
			.done(function(r){
				if (!r || r.error){
					_this.requestComplete(request_info.request, true);
					return;
				}


				_this.putRequestedData(request_info.request, r.response, r.error);

			})
			.fail(function(){
				_this.requestComplete(request_info.request, true);
			}).always(function() {
				request_info.done = true;
			});
		return request_info;
	}
});


return {
	VkUserTracks: VkUserTracks,
	VKFriendsList: VKFriendsList
};
});