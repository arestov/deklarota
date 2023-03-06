
import spv from '../libs/spv'
import $ from 'cash-dom'
import filters from './modules/filters'
// import getUsageTree from '../libs/provoda/structure/getUsageTree'
import mutateGlobalTplFilters from '../libs/provoda/mutateGlobalTplFilters'
import _updateAttr from '../libs/provoda/_internal/_updateAttr'
import View from '../libs/provoda/View'
import spvExtend from '../libs/spv/inh'

mutateGlobalTplFilters(function(filter_name) {
  if (filters[filter_name]) {
    return filters[filter_name]
  } else {
    throw new Error('no filter: ' + filter_name)
  }
})

const reportStructure = () => {
  // if (this.skip_structure_reporing == true) {
  //   return
  // }
  // var used_data_structure = getUsageTree([], [], this, this)
  // this.used_data_structure = used_data_structure
  // this.parent_view.RPCLegacy('knowViewingDataStructure', this.constr_id, this.used_data_structure)
  // this.parent_view.RPCLegacy('updateState', 'view_structure', used_data_structure)
  // console.log('used_data_structure', this.used_data_structure)
}

const PvTemplate = View._PvTemplate

export const AppBase = spvExtend(View, {}, {
  location_name: 'root_view',

  dom_rp: true,
  createDetails: function() {
    this.root_view = this
    this.root_view.root_app_view = this
    const opts = this.opts || this.parent_view.opts
    this.d = opts.d
    this.dom_related_props.push('calls_flow')

    this.samples = {}
    this.dom_related_props.push('samples')

    const getSampleForTemplate = (function(_this) {
      return function(sample_name, simple, opts) {
        return _this.getSample(sample_name, simple, opts)
      }
    })(this)

    const templator = PvTemplate.templator(this._getCallsFlow(), getSampleForTemplate)
    this.pvtemplate = templator.template
    this.pvsampler = templator.sampler

    const self = this

    Promise.resolve().then(function() {
      spv.domReady(self.d, self.inputFn(function() {
        this.useInterface('bodyNode', this.d.body)
        this.updateState('domAndInterfacesReady', true)
        // since we have manual_states_connect
        self.connectStates()
      }))
    })
  },
  manual_states_connect: true,
  getSampler: function(sample_name) {
    const sampler = this.samples[sample_name]
    if (sampler) {
      return sampler
    }

    const ui_samples = this.getInterface('ui_samples')

    let sample_node_raw = ui_samples.children('.' + sample_name)
    let sample_node = sample_node_raw[0]

    if (!sample_node) {
      sample_node_raw = $(this.requirePart(sample_name))
      sample_node = sample_node[0]
    }

    if (!sample_node) {
      throw new Error('no such sample')
    }

    this.samples[sample_name] = this.pvsampler(sample_node)
    return this.samples[sample_name]
  },
  getSample: function(sample_name, simple, options) {
    const sampler = this.getSampler(sample_name)

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
  attrs: {
    domAndInterfacesReady: ['input', false],
  },
  effects: {
    api: {
      ui_samples: [
        '_node_id',
        ['self', 'bodyNode', 'els'],
        (self, body, els) => {
          if (els.ui_samples) {
            return els.ui_samples
          }

          if (self.ui_samples_csel === null) {
            return null
          }

          const selector = self.ui_samples_csel || '#ui-samples'
          const ui_samples = $(body).find(selector)
          ui_samples.ui_samples.detach()
          return ui_samples
        }
      ]
    },
    out: {
      __build_children: {
        api: ['self', 'ui_samples'],
        create_when: {
          api_inits: true,
        },
        trigger: ['domAndInterfacesReady', '$meta$apis$con$appended'],
        require: ['domAndInterfacesReady', '$meta$apis$con$appended'],
        fn: function(self) {
          self.input(() => {
            // since we have manual_states_connect
            self.connectChildrenModels()
            self.requestView()
          })
        }
      },
      __build_template: {
        api: ['self', 'con', 'ui_samples'],
        create_when: { api_inits: false },
        trigger: ['$meta$apis$con$used'],
        require: ['$meta$apis$con$used'],
        fn: (self, con) => {
          self.c = con
          self.createTemplate()
          reportStructure(self)

          self.input(() => {
            _updateAttr(self, '$meta$apis$con$appended', true)
            _updateAttr(self, 'vis_con_appended', true)

          })
        },
      },
    }
  }
})
