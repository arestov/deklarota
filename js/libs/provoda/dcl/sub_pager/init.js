

export default function init(self) {
  self.sub_pages = null
  if (self._sub_pages || self._sub_pager || self.subPager) {
    self.sub_pages = {}
  }

  self._last_subpages = null
  if (self._sub_pager && self._sub_pager.can_be_reusable) {
    self._last_subpages = {}
  }

};
