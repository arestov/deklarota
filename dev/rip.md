- convertEventName

- preview_nesting_source, preview_list, preview_mlist_name, lists_list

- bindStaCons, preseting main_list_name, legacy_rel_helpers

- `child_change-` event

- `authInit` -> `switchPmd`

- `vip_state_change-`, `_legacy_vip_events`

- `state_change-`

- `this.trigger('requests', added, space);`

- view_parts, parts_builder, checkDepVP, getPart, requirePart, requireAllParts

- overrideStateSilently

- removed cache everything. use `allow_cache` if you want requests cache

- TEMP Broken animateMapSlice/MapSliceSpyglassCore

- removed sync_tpl from updateProxy

- removed skip_handler from updateProxy

- deprecate opts for updateProxy

- don't use CallbacksFlow to init app

- animationMark from AppModel

- setFullUrl in BrowseMap

- setVisState from View

- remove CallbacksFlow from public space

- attrs{some: ['compx', 55]} (use attrs{some: ['input', 55]})

- removed requirement to have nav_title for sub_pages

- jquery-2.1.4

- simplify cache_key

- remove net_apis (seesu module)

- remove md5

- views/lul (seesu module)

- view_serv

- loadImage

- seesu, StartPage, FakeSpyglass, SongsListModernBase, SongNotify, SongBaseModern, NotifyCounter, RootBwlevSeesu, ListPlayRequest, LastFMArtistImagesSelector, subscribeLfmAuthAction, effects (seesu modules)

- AppView (seesu "AppView", `wp_box = new WPBox`/ arrow keyboard navigation usage example, 'spyglass-navigation'/MapSliceSpyglass)

- StartPageView (seesu module, `this.els.start_screen` usage example, dk-foreign?)

- env, localizer, localize (seesu parts/helpers)

- app_serv

- Panoramator (like fotorama.io), htmlencoding, cache_ajax, w_storage, aReq, wrapRequest, preloadImage, verticalAlign

- appendStyle, declr_parsers, comd, morph_helpers (seesu parts)

- AppModel, LoadableList (seesu parts)

- BrowseLevNavView, BrowseLevView, MapSliceSpyglass, nav (seesu map_slice views)

- RootBwlevView

- coct, etc_views, map_slice/pages, CurrentSongView, createNiceButton

- getLFMImageWrap

- removed sub_page-* (use sub_page: {})

- removed legacy `nest_compx-*`, `nest_conj-*`, `nest_rqc-*`, `nest_sel-*`

- removed legacy `nest-*`

- deprecated object structure for attr.comp ({depends_on: ...})

- 'compx' -> 'comp'

- 'stch-' called after calculations, not in calculations progress

- don't use abortFlowSteps for 'stch'

- don't use abortFlowSteps for 'stev'

- don't use abortFlowSteps for 'collch'

- default_states

- don't pass model ref to comp attr fn

- remove svg-mod

- remove requestNavParent from View

- remove dead getConnectedBwlev

- remove WebComplexTreesView, BrowserAppRootView, AppBaseView

- remove pv.initWebApp util

- remove pv.views_proxies (use app/prepare {proxies: true})

- remove legacy_app and matchNav

- internal 'navi' interface is semi depricated. use `__use_navi` flag to enable it

- requests batching (ids_declr)

- no network_api (interface instance) for parse_items

- remove redirectBWLev

- deprecate `subitems` and `subitems_source_name` for initingParams

- deprecate `_x_skip_navigation` for perspectivator residents

- remove mpl_attached attr

- deprecate effects inside effects.out.effect

- deprecate handling_v2_init = false

- deprecate init method on models

- remove getMainListChangeOpts, ignore skip_report option for rel updates

- remove rel beforeReportChange method

- remove findMustBePresentDataItem

- remove injectExcessDataItem

- deprecate nest_rq_split

- deprecate effects.in.request-rel.parse_serv

- deprecate/remove subPager

- remove sub_pager, can_be_reusable/$$reusable_url attr

- remove `sub_page: {...}`

- remove navi interface from common router

- remove switchPmd

- deprecate preload_on for rel.nest

- deprecate events for glue_rels

- remove glue_rels https://github.com/arestov/deklarota/pull/106 (first 0199e00)

- remove allow_data_init prop from BrowserMap model

- remove getPagingInfo & paging_opts for rel request

- remove preloading with loadNestingsByStruc, to_load in bwlev (nice thing, but can't continue to support that kind code)

- remove preloadStart, loadStart

- remove tpl_r_events

- deprecate showInterest/followFromTo

- remove .state()
