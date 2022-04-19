import emptyArray from '../../emptyArray'
import type { EmptyArray } from '../empty.types'

type maybeArray<Item> = null | undefined | Item[]


const useSharedEmpty = function<Item, T extends maybeArray<Item>>(list: T): EmptyArray | T {
  if (list != null && !list.length) {
    return emptyArray
  }

  return list
}

const zip_fns = {
  'one': function<Item, T extends maybeArray<Item>>(list: T): null | undefined | Item {
    return list && list[0]
  },
  'every': function<Item, T extends maybeArray<Item>>(list: T): null | undefined | boolean {
    return list && list.every(Boolean)
  },
  'some': function<Item, T extends maybeArray<Item>>(list: T): null | undefined | boolean {
    return list && list.some(Boolean)
  },
  'find': function<Item, T extends maybeArray<Item>>(list: T): null | undefined | Item {
    return list && list.find(Boolean)
  },
  'filter': function<ListItem, T extends maybeArray<ListItem>>(list: T): ListItem[] | null | undefined | EmptyArray {
    if (list == null) {
      return list
    }
    return useSharedEmpty(list.filter(Boolean))
  },
  'all': function<Item, T extends maybeArray<Item>>(list: T): T | EmptyArray {
    return useSharedEmpty(list)
  },
  'length': function<Item, T extends maybeArray<Item>>(list: T): null | undefined | number {
    return list && list.length
  },
  'notEmpty': function<Item, T extends maybeArray<Item>>(list: T): boolean {
    return Boolean(list && list.length)
  },
}

export default zip_fns
