export default function checkSubpager(self) {
  const sub_pager = self.hasOwnProperty('sub_pager') && self.sub_pager

  if (!sub_pager) {
    return
  }

  throw new Error('sub_pager is depricated')
}
