
import pvState from '../../utils/state'
import executeStringTemplate from '../../routes/legacy/executeStringTemplate'
import _updateRel from '../../_internal/_updateRel'

function addHead(md, hands, head) {
  hands.heads.push(head)
  md.nextTick(function(hands, head) {
    runHeadFilter(this.current_motivator, head, hands)
  }, [hands, head], true)
}

function Hands(dcl) {
  this.dcl = dcl
  this.declr = dcl
  this.items = null
  this.heads = []
  this.hands = this

  // sometimes different heads can share one `hands` object

  // when filtering does not depend on head
  // we can share `filtering` result for different heads
  // this.can_filter_here = !dcl.deps.base.cond

  // when sorting does not depend on head
  // we can share `sorting` result for different heads
  // this.can_sort_here = this.can_filter_here && !dcl.deps.base.sort

  Object.seal(this)
}

var count = 1
var NestSelector = function(md, declr, hands) {
  this.num = 'nsel-' + (count++)
  this.md = md
  this.declr = declr
  this.hands = hands

  this.items_changed = null
  // this.waiting_chd_count = false;

  this.state_name = declr.deps.base.all.list
  this.short_state_name = declr.deps.base.all.shorts


  this.handled_subl_wtchs = null
  this.ordered_items = null
  Object.seal(this)
}
var noop = function() {}


NestSelector.Hands = Hands
NestSelector.addHead = addHead

NestSelector.prototype.selector = []
NestSelector.prototype.state_handler = handleChdDestState


NestSelector.handleChdDeepState = handleChdDeepState
NestSelector.handleChdCount = handleChdCount
NestSelector.handleAdding = noop
NestSelector.handleRemoving = noop
NestSelector.rerun = rerun

function handleChdDestState(motivator, fn, head) {
  // input - changed "dest" state
  // expected - invalidated all item conditions, rerunned query, updated nesting
  var hands = head.hands

  runHeadFilter(motivator, head, hands)
}

function handleChdDeepState(motivator, _, lnwatch, args) {
  // input - changed "deep source" state
  // expected - invalidated one item condition, rerunned query, updated nesting
  var md = args[3]
  // dont trust state changes. can be outdated. read real state
  // var value = args[1];

  var hands = lnwatch.data

  if (hands.items && !hands.items.includes(md)) {
    return
  }

  runFilter(motivator, hands)
}

function rerun(motivator, _, lnwatch) {
  runFilter(motivator, lnwatch.data)
}

function checkCondition(declr, base_md, cur_md) {
  const args_schema = declr.args_schema
  const selectFn = declr.selectFn

  var args = new Array(args_schema.length)
  for (var i = 0; i < args_schema.length; i++) {
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

  var result = []

  for (var i = 0; i < items_list.length; i++) {
    var cur = items_list[i]
    if (isFine(dcl, base_md, cur)) {
      result.push(cur)
    }
  }

  return result
}

function getReadyItems(head, hands, filtered) {
  var dcl = head.declr

  if (!dcl.map) {
    return filtered
  }

  if (!filtered) {return}
  var arr = new Array(filtered.length)
  var distant = dcl.map.from_distant_model
  for (var i = 0; i < filtered.length; i++) {
    var cur = filtered[i]
    var md_from = switchDistant(distant, head.md, cur)
    var md_states_from = switchDistant(distant, cur, head.md)

    arr[i] = executeStringTemplate(
      head.md.app, md_from, dcl.map.template, false, md_states_from
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
  var filtered = getCommonFiltered(dcl, base_md, items_list)
  var sorted = (filtered && dcl.sortFn)
    ? getCommonSorted(dcl, base_md, filtered)
    : filtered

  return sorted
}

function runHeadFilter(motivator, head, hands) {
  var sorted = getFilteredAndSorted(head.declr, head.md, hands.items)
  var result = getReadyItems(head, hands, sorted)

  var md = head.md
  var old_motivator = md.current_motivator
  md.current_motivator = motivator
  _updateRel(md, head.declr.dest_name, result)
  md.current_motivator = old_motivator

  return result
}

function runFilter(motivator, hands) {
  for (var i = 0; i < hands.heads.length; i++) {
    runHeadFilter(motivator, hands.heads[i], hands)
  }
}

function handleChdCount(motivator, _, lnwatch, __, items) {
  // input - changed list order or length
  // expected - rerunned query, updated nesting

  var hands = lnwatch.data
  hands.items = items
  runFilter(motivator, hands)
}

export default NestSelector
