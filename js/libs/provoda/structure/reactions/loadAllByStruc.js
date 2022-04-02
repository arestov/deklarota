

export default function loadAllByStruc(md, obj, prev) {
  // obj.list is `struc`
  if (!obj.inactive) {
    for (let i = 0; i < obj.list.length; i++) {
      const cur = obj.list[i]
      if (!cur) {continue}
      // md.addReqDependence(obj.supervision, cur)
    }

  } else if (prev && prev.list) {
    for (let i = 0; i < prev.list.length; i++) {
      const cur = prev.list[i]
      if (!cur) {continue}
      // md.removeReqDependence(obj.supervision, cur)
    }
  }
};
