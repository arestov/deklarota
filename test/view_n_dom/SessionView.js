import View from 'dkt/view/View'
import spv from 'dkt-all/libs/spv'

export default function createRootBwlevView(RootView) {
  return spv.inh(View, null, {
    'collch-pioneer': true,
    children_views: {
      pioneer: RootView,
    },
  })
}
