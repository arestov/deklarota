
import spv from '../libs/spv'
import $ from 'cash-dom'
import filters from './modules/filters'
import getUsageTree from '../libs/provoda/structure/getUsageTree'
import mutateGlobalTplFilters from '../libs/provoda/mutateGlobalTplFilters'
import _updateAttr from '../libs/provoda/_internal/_updateAttr'
import View from '../libs/provoda/View'


mutateGlobalTplFilters(function(filter_name) {
  if (filters[filter_name]) {
    return filters[filter_name]
  } else {
    throw new Error('no filter: ' + filter_name)
  }
})

var BrowserAppRootView = spv.inh(View, {}, {
  dom_rp: true,
  createDetails: function() {
    this.root_view = this
    this.root_view.root_app_view = this
    var opts = this.opts || this.parent_view.opts
    this.d = opts.d
    this.dom_related_props.push('calls_flow')

    var _this = this
    if (opts.can_die && spv.getDefaultView(this.d)) {
      this.can_die = true
      this.checkLiveState = function() {
        if (!spv.getDefaultView(_this.d)) {
          _this.reportDomDeath()
          return true
        }
      }

      this.lst_interval = setInterval(this.checkLiveState, 1000)

    }

    if (opts == null || opts.interfaces == null) {
      return
    }

    for (var interface_name in opts.interfaces) {
      this.useInterface(interface_name, opts.interfaces[interface_name])
    }

  },
  reportDomDeath: function() {
    if (this.can_die && !this.dead) {
      this.dead = true
      clearInterval(this.lst_interval)
    //	var d = this.d;
    //	delete this.d;
      this.die()
      console.log('DOM dead! ' + this.nums)

    }
  },
  isAlive: function() {
    if (this.dead) {
      return false
    }
    return !this.checkLiveState || !this.checkLiveState()
  }
})

var PvTemplate = View._PvTemplate
var AppBaseView = spv.inh(BrowserAppRootView, {}, {
  location_name: 'root_view',

  createDetails: function() {
    this._super()

    var getSampleForTemplate = (function(_this) {
      return function(sample_name, simple, opts) {
        return _this.getSample(sample_name, simple, opts)
      }
    })(this)

    var templator = PvTemplate.templator(this._getCallsFlow(), getSampleForTemplate)
    this.pvtemplate = templator.template
    this.pvsampler = templator.sampler

    this.tpls = []
    // this.struc_store = {};
    this.els = {}
    this.samples = {}
    this.dom_related_props.push('samples', 'els', 'struc_store')

  },

  completeDomBuilding: function() {
    this.connectStates()
    this.connectChildrenModels()
    this.requestView()
  },

  manual_states_connect: true,

  getScrollVP: function() {
    return this.els.scrolling_viewport
  },

  scollNeeded: function() {
    return window.document.body.scrollHeight > window.document.body.clientHeight
  },

  scrollTo: function(jnode, view_port, opts) {
    if (!jnode) {return false}
  //	if (!this.view_port || !this.view_port.node){return false;}

    //var scrollingv_port = ;

    //var element = view.getC();

  //	var jnode = $(view.getC());
    if (!jnode[0]) {
      return
    }

    var scrollTop = function(wNode, value) {
      var node = wNode.get(0)
      if (value == null) {
        return node.scrollTop
      }

      node.scrollTop = value
    }


    var view_port_limit = (opts && opts.vp_limit) || 1

    var svp = view_port || this.getScrollVP(),
      scroll_c = svp.offset ? svp.node : svp.node,
      scroll_top = scrollTop(scroll_c), //top
      scrolling_viewport_height = svp.node.height(), //height
      padding = (scrolling_viewport_height * (1 - view_port_limit)) / 2,
      scroll_bottom = scroll_top + scrolling_viewport_height //bottom

    var top_limit = scroll_top + padding,
      bottom_limit = scroll_bottom - padding

    var node_position
    var node_top_post = jnode.offset().top
    if (svp.offset) {
      node_position = node_top_post
    } else{
      //throw new Error('fix this!');
      var spv_top_pos = scroll_c.offset().top
      node_position = scroll_top + (node_top_post - spv_top_pos)

      //node_position = jnode.position().top + scroll_top + this.c.parent().position().top;
    }
    /*

    var el_bottom = jnode.height() + node_position;

    var new_position;
    if ( el_bottom > bottom_limit || el_bottom < top_limit){
      new_position =  el_bottom - scrolling_viewport_height/2;
    }*/
    var new_position
    if (node_position < top_limit || node_position > bottom_limit) {
      var allowed_height = Math.min(jnode.height(), scrolling_viewport_height)
      new_position = node_position - allowed_height / 2 - scrolling_viewport_height / 2
      //new_position =  node_position - scrolling_viewport_height/2;
    }
    if (new_position) {
      if (opts && opts.animate) {
        console.warn('animate scrolling')
        scrollTop(scroll_c, new_position)
      } else {
        scrollTop(scroll_c, new_position)
      }

    }
  },

  getSampler: function(sample_name) {
    var sampler = this.samples[sample_name], sample_node
    if (!sampler) {
      sample_node = this.els.ui_samples.children('.' + sample_name)
      sample_node = sample_node[0]
      if (sample_node) {

        sampler = this.samples[sample_name] = this.pvsampler(sample_node)
      }

    }
    if (!sampler) {
      sample_node = $(this.requirePart(sample_name))
      sample_node = sample_node[0]
      if (sample_node) {
        sampler = this.samples[sample_name] = this.pvsampler(sample_node)
      }

    }
    if (!sampler) {
      throw new Error('no such sample')
    }
    return sampler
  },

  getSample: function(sample_name, simple, options) {
    var sampler = this.getSampler(sample_name)

    if (sampler.getClone) {
      if (simple) {
        return sampler.getClone(options)
      } else {
        return $(sampler.getClone(options))
      }
    } else {
      if (options) {
        throw new Error('not support options here')
      }
      return $(sampler).clone()
    }
  },
})
AppBaseView.BrowserAppRootView = BrowserAppRootView

var WebAppView = spv.inh(AppBaseView, {}, {
  createDetails: function() {
    this._super()
    this.root_view_uid = Date.now()

    var _this = this
    Promise.resolve().then(function() {
      spv.domReady(_this.d, _this.inputFn(function() {
        _this.buildAppDOM()
        _this.onDomBuild()
        _this.completeDomBuilding()
      }))
    });

    (function() {
      var wd = this.getWindow()
      var checkWindowSizes = spv.debounce(function() {
        _this.updateManyStates({
          window_height: wd.innerHeight,
          window_width: wd.innerWidth
        })
      }, 150)

      spv.addEvent(wd, 'resize', checkWindowSizes)

      this.onDie(function() {
        spv.removeEvent(wd, 'resize', checkWindowSizes)
        wd = null
      })


    }).call(this)

    this.onDie(function() {

      _this = null
    })
  },
  remove: function() {
    this._super()
    if (this.d) {
      var wd = this.getWindow()
      $(wd).off()
      $(wd).remove()
      wd = null

      if (this.d.body && this.d.body.firstChild && this.d.body.firstChild.parentNode) {
        $(this.d.body).off().find('*').remove()

      }
      $(this.d).off()
      $(this.d).remove()


    }


    this.d = null
  },
  resortQueue: function(queue) {
    return this.parent_view.resortQueue(queue)
  },
  onDomBuild: function() {
    if (this.skip_structure_reporing == true) {
      return
    }
    var used_data_structure = getUsageTree([], [], this, this)
    this.used_data_structure = used_data_structure
    this.parent_view.RPCLegacy('knowViewingDataStructure', this.constr_id, this.used_data_structure)
    this.parent_view.RPCLegacy('updateState', 'view_structure', used_data_structure)
    console.log('used_data_structure', this.used_data_structure)

  },
  buildAppDOM: function() {
    this.c = $(this.d.body)
    var _this = this
    //var d = this.d;


    var wd = this.getWindow()
    _this.updateManyStates({
      window_height: wd.innerHeight,
      window_width: wd.innerWidth
    })
    if (this.ui_samples_csel) {
      this.els.ui_samples = this.c.find(this.ui_samples_csel)
      this.els.ui_samples.detach()
    }

    this.useInterface('con', this.getCNode())
    _updateAttr(this, '$meta$apis$con$appended', true)
    _updateAttr(this, 'vis_con_appended', true)

  },
  ui_samples_csel: '#ui-samples'
})
AppBaseView.WebAppView = WebAppView

var WebComplexTreesView = spv.inh(WebAppView, {}, {

  remove: function() {
    this._super()

    //this.search_input = null;
  },
  buildAppDOM: spv.precall(AppBaseView.WebAppView.prototype.buildAppDOM, function() {
    this.selectKeyNodes()
  }),
  onDomBuild: function() {
    this._super()
    this.c.addClass('app-loaded')
  },
})

AppBaseView.WebComplexTreesView = WebComplexTreesView

export default AppBaseView
