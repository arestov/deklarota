export default function checkSubpager(self) {
  const sub_pager = self.hasOwnProperty('sub_pager') && self.sub_pager

  if (!sub_pager) {
    return
  }

  if (sub_pager.item && sub_pager.by_type) {
    throw new Error('can`t be both `item` and `by_type`')
  }

  throw new Error('sub_pager is depricated')
}
