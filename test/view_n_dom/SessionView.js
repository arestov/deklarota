import View from 'dkt/view/View'
import spv from 'dkt-all/libs/spv'

export default function createRootBwlevView(RootView) {
  return spv.inh(View, null, {
    resortQueue(queue) {
      if (queue) {
        queue.removePrioMarks()
      } else if (this.all_queues) {
        this.all_queues.forEach((i) => i.removePrioMarks())
      }

      if (this.important_bwlev_view) {
        this.important_bwlev_view.setPrio()
      }
    },

    'collch-pioneer': true,
    children_views: {
      pioneer: RootView,
    },
  })
}
