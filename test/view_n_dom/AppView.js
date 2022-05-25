import $ from 'cash-dom'
import spv from 'dkt-all/libs/spv'
import { AppBase } from 'dkt-all/views/AppBaseView'


const AppView = spv.inh(AppBase, null, {
  isRootView: true,

  effects: {
    api: {
      ui_samples: [
        ['_provoda_id'],
        ['bodyNode', 'document'],
        (body, doc) => {
          const uiSamplesRaw = $(body).find('#ui-samples').detach()
          const uiSamples = $(doc.importNode(uiSamplesRaw.get(0).content, true))
          return uiSamples
        },
      ],
      con: [
        ['_provoda_id'],
        ['bodyNode'],
        bodyNode => bodyNode.querySelector('.app'),
      ],
    },
  },

  tpl_events: {
  },

  skip_structure_reporing: true,

  scrollToWP(_cwp) {},

})


export default AppView
