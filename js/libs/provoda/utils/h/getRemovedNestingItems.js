

export default function getRemovedNestingItems(array, old_value) {
  let removed
  if (Array.isArray(old_value)) {
    if (!array) {
      removed = old_value.slice(0)
    } else {
      removed = []
      for (let i = 0; i < old_value.length; i++) {
        const cur = old_value[i]
        if (array.indexOf(cur) == -1) {
          removed.push(cur)
        }
      }
    }
    //console.log(removed);
  } else if (old_value && array != old_value) {
    removed = [old_value]
  }
  return removed
};
