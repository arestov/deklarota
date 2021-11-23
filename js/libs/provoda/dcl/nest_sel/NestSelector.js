
import pvState from '../../utils/state'
import executeStringTemplate from '../../routes/legacy/executeStringTemplate'

function checkCondition(declr, base_md, cur_md) {
  const args_schema = declr.args_schema
  const selectFn = declr.selectFn

  const args = new Array(args_schema.length)
  for (let i = 0; i < args_schema.length; i++) {
    const cur = args_schema[i]
    switch (cur.type) {
      case 'deep':
        args[i] = pvState(cur_md, cur.name)
        break
      case 'base':
        args[i] = pvState(base_md, cur.name)
        break
      default:
        throw new Error('unknow type dep type')
    }
  }
  return Boolean(selectFn.apply(null, args))
}

function isFine(declr, base_md, md) {
  return checkCondition(declr, base_md, md)
}

function switchDistant(do_switch, base, deep) {
  return do_switch ? deep : base
}

function getFiltered(dcl, base_md, items_list) {
  if (!items_list) {return}

  const cond_base = dcl.deps.base.cond
  const cond_deep = dcl.deps.deep.cond

  if (!(cond_base && cond_base.list) && !(cond_deep && cond_deep.list)) {
    return items_list
  }

  const result = []

  for (let i = 0; i < items_list.length; i++) {
    const cur = items_list[i]
    if (isFine(dcl, base_md, cur)) {
      result.push(cur)
    }
  }

  return result
}

function getReadyItems(dcl, base_md, filtered) {

  if (!dcl.map) {
    return filtered
  }

  if (!filtered) {return}
  const arr = new Array(filtered.length)
  const distant = dcl.map.from_distant_model
  for (let i = 0; i < filtered.length; i++) {
    const cur = filtered[i]
    const md_from = switchDistant(distant, base_md, cur)
    const md_states_from = switchDistant(distant, cur, base_md)

    arr[i] = executeStringTemplate(
      base_md.app, md_from, dcl.map.template, false, md_states_from
    )
  }
  return arr
}

function getCommonFiltered(dcl, base_md, items_list) {
  return getFiltered(dcl, base_md, items_list)
}

function getSorted(dcl, base_md, list) {
  if (!list) {return}
  const sortFn = dcl.sortFn

  return list.slice().sort(function(one, two) {
    return sortFn.call(null, one, two, base_md)
  })
}

function getCommonSorted(dcl, base_md, items_list) {
  return getSorted(dcl, base_md, items_list)
}

function getFilteredAndSorted(dcl, base_md, items_list) {
  const filtered = getCommonFiltered(dcl, base_md, items_list)
  const sorted = (filtered && dcl.sortFn)
    ? getCommonSorted(dcl, base_md, filtered)
    : filtered

  return sorted
}

export function calcRelSelByDcl(dcl, base_md, list) {
  const sorted = getFilteredAndSorted(dcl, base_md, list)
  return getReadyItems(dcl, base_md, sorted)
}
