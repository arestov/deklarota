
import spv from '../../spv'
import _updateRel from '../_internal/_updateRel'
import _updateAttr from '../_internal/_updateAttr'
import probeDiff from './probeDiff'
import getBwlevParent from './getBwlevParent'

const complexBrowsing = function(bwlev, md, value) {
  // map levels. without knowing which map
  let obj = md.state('bmp_show')
  obj = obj && spv.cloneObj({}, obj) || {}
  const num = bwlev.state('map_level_num')
  obj[num] = value
  _updateAttr(md, 'bmp_show', obj)
}

const model_mapch = {
  'move-view': function(change) {
    const md = change.target
    const bwlev = change.bwlev

    // debugger;

    if (change.value) {
      const possible_parent = change.target.getParentMapModel()
      const parent = possible_parent && possible_parent.toProperNavParent()
      if (parent) {
        const bwlev_parent = change.bwlev.getParentMapModel()
        _updateAttr(bwlev_parent, 'mp_has_focus', false)
        _updateAttr(parent, 'mp_has_focus', false)
      }
    }

    _updateAttr(bwlev, 'mpl_attached', !change.value)
    _updateAttr(md, 'mp_show', change.value)
    _updateAttr(bwlev, 'mp_show', change.value)
    complexBrowsing(bwlev, md, change.value)
  },
  'zoom-out': function(change) {
    // debugger;
    const md = change.target
    const bwlev = change.bwlev
    _updateAttr(bwlev, 'mp_show', false)
    _updateAttr(md, 'mp_show', false)
    complexBrowsing(bwlev, md, false)
  },
  'destroy': function(change) {
    const md = change.target
    const bwlev = change.bwlev
    _updateAttr(md, 'mp_show', false)
    _updateAttr(bwlev, 'mp_show', false)
    complexBrowsing(bwlev, md, false)
  }
}

// var minDistance = function(obj) {
// 	if (!obj) {return;}
// 	var values = [];
// 	for (var key in obj) {
// 		if (!obj[key]) {
// 			continue;
// 		}
// 		values.push(obj[key]);
// 	}

// 	if (!values.length) {return;}

// 	return Math.min.apply(null, values);
// };


// var depthValue = function(obj_raw, key, value) {
// 	var obj = obj_raw && spv.cloneObj({}, obj_raw) || {};
// 	obj[key] = value;
// 	return obj;
// };

const goUp = function(bwlev, cb) {
  if (!bwlev) {return}
  let count = 1
  let md = bwlev.getNesting('pioneer')
  let cur = bwlev
  while (cur) {
    cb(cur, md, count)
    // it's ok to get parent (without using getRouteStepParent) from bwlev
    cur = getBwlevParent(cur)
    md = cur && cur.getNesting('pioneer')
    count++
  }
}

const setDft = function(get_atom_value) {
  return function(bwlev, _md, count) {
    const atom_value = get_atom_value(count)
    // var value = depthValue(md.state('bmp_dft'), bwlev._provoda_id, atom_value);
    // _updateAttr(md, 'bmp_dft', value);
    // _updateAttr(md, 'mp_dft', minDistance(value));
    _updateAttr(bwlev, 'mp_dft', atom_value)
  }
}

const dftCount = setDft(function(count) {
  return count
})

const dftNull = setDft(function() {
  return null
})

const depth = function(bwlev, old_bwlev) {
  goUp(old_bwlev, dftNull)
  goUp(bwlev, dftCount)
  return bwlev
}

const getPioneer = function(bwlev) {
  return bwlev.getNesting('pioneer')
}

const asMDR = function(md) {
  return md && md.getMDReplacer()
}

function animateMapChanges(fake_spyglass, next_tree, prev_tree) {
  const diff = probeDiff(next_tree, prev_tree)

  if (!diff.array || !diff.array.length) {
    return
  }

  const bwlevs = next_tree
  const models = bwlevs.map(getPioneer)

  _updateRel(fake_spyglass, 'navigation', bwlevs)

  const changes = diff
  let i
  let all_changhes = spv.filter(changes.array, 'changes')


  all_changhes = Array.prototype.concat.apply(Array.prototype, all_changhes)
 //var models = spv.filter(all_changhes, 'target');

  for (i = 0; i < all_changhes.length; i++) {
    const change = all_changhes[i]
    const handler = model_mapch[change.type]
    if (handler) {
      handler.call(null, change, fake_spyglass)
    }

    if (!handler) {
      throw new Error('unknown change type: ' + change.type)
    }
  }

 /*
   подсветить/заменить текущий источник
   проскроллить к источнику при отдалении
   просроллить к источнику при приближении
 */

 // var bwlevs = residents && spv.filter(residents, 'lev.bwlev');


  if (diff.target) {
    if (fake_spyglass.current_mp_md) {
      _updateAttr(fake_spyglass.current_mp_md, 'mp_has_focus', false)
    }
    const target_md = fake_spyglass.current_mp_md = diff.target

    fake_spyglass.current_mp_bwlev = depth(diff.bwlev, fake_spyglass.current_mp_bwlev)

    _updateAttr(target_md, 'mp_has_focus', true)
    _updateAttr(diff.bwlev, 'mp_has_focus', true)

   // _updateAttr(fake_spyglass, 'show_search_form', !!target_md.state('needs_search_from'));
    _updateAttr(fake_spyglass, 'full_page_need', !!target_md.full_page_need)
    _updateRel(fake_spyglass, 'current_mp_md', target_md)
    _updateRel(fake_spyglass, 'current_mp_bwlev', diff.bwlev)
   //_updateAttr(target_md, 'mp-highlight', false);


  }

  let all_items

  let mp_show_wrap
  if (models) {

    all_items = models.concat(bwlevs)

    mp_show_wrap = {
      items: models.map(asMDR),
      bwlevs: bwlevs.map(asMDR),
      all_items: all_items.map(asMDR),
      mp_show_states: []
    }
    for (i = 0; i < models.length; i++) {
      mp_show_wrap.mp_show_states.push(models[i].state('mp_show'))
    }
  }


  _updateRel(fake_spyglass, 'map_slice', next_tree)

}

function changeZoomSimple(bwlev, value_raw) {
  const value = Boolean(value_raw)
  _updateAttr(bwlev, 'mp_show', value)
  const md = bwlev.getNesting('pioneer')
  complexBrowsing(bwlev, md, value)
}

export const switchCurrentBwlev = (bwlev, prev) => {
  if (prev) {
    changeZoomSimple(prev, false)
  }
  if (bwlev) {
    changeZoomSimple(bwlev, true)
  }

  depth(bwlev, prev)
}

export default animateMapChanges
