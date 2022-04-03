import appRoot from 'pv/appRoot.js'
import mergeBhv from 'pv/dcl/merge.js'

const appProps = {
  init: target => {
    // eslint-disable-next-line
    target.start_page = target
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
