

export default function getParent(start_view, count) {
  let cur = start_view
  for (let i = 0; i < count; i++) {
    cur = cur.getStrucParent()
  }
  return cur
};
