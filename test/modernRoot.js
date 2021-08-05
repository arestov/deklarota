import appRoot from 'pv/appRoot.js'
import mergeBhv from 'pv/dcl/merge.js'
import updateRel from 'pv/updateRel.js'

const appProps = {
  init: target => {
    // eslint-disable-next-line
    target.start_page = target
    updateRel(target, 'start_page', target.start_page)
  },
  zero_map_level: true,
  model_name: 'start_page',
}

const modernRoot = startModel => appRoot(
  mergeBhv(
    appProps,
    startModel,
  ),
  appProps.init,
)

export default modernRoot
