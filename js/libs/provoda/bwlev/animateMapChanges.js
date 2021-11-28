
import spv, { countKeys } from '../../spv'
import _updateRel from '../_internal/_updateRel'
import _updateAttr from '../_internal/_updateAttr'
import probeDiff from './probeDiff'
import getBwlevParent from './getBwlevParent'

const complexBrowsing = function(bwlev, md, value) {
  let obj = {...md.state('$meta$perspective$eachshow')}

  const key = bwlev._provoda_id

  if (value) {
    obj[key] = value
    obj = obj
  } else {
    delete obj[key]
    obj = obj
  }

  Object.freeze(obj)

  _updateAttr(bwlev, 'mp_show', value)
  _updateAttr(md, '$meta$perspective$eachshow', obj)
  _updateAttr(md, 'mp_show', Boolean(countKeys(obj)))
}

const handleMoveView = (change) => {
  const bwlev = change.bwlev
  const md = bwlev.getNesting('pioneer')

  // debugger;

  if (change.value) {
    const possible_parent = md.getParentMapModel()
    const parent = possible_parent && possible_parent.toProperNavParent()
    if (parent) {
      const bwlev_parent = change.bwlev.getParentMapModel()
      _updateAttr(bwlev_parent, 'mp_has_focus', false)
      _updateAttr(parent, 'mp_has_focus', false)
    }
  }

  complexBrowsing(bwlev, md, change.value)
}

const handleChange = (_perspectivator, change) => {
  switch (change.type) {
    case 'move-view': {
      handleMoveView(change)
      return
    }
    default: {
      throw new Error('unknown change type: ' + change.type)
    }
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

function animateMapChanges(fake_spyglass, next_tree, prev_tree) {
  const diff = probeDiff(next_tree, prev_tree)

  if (!diff.array || !diff.array.length) {
    return
  }

  const bwlevs = next_tree

  _updateRel(fake_spyglass, 'navigation', bwlevs)

  const changes = diff
  let i
  let all_changhes = spv.filter(changes.array, 'changes')


  all_changhes = Array.prototype.concat.apply(Array.prototype, all_changhes)
 //var models = spv.filter(all_changhes, 'target');

  for (i = 0; i < all_changhes.length; i++) {
    const change = all_changhes[i]
    handleChange(fake_spyglass, change)
  }

 /*
   подсветить/заменить текущий источник
   проскроллить к источнику при отдалении
   просроллить к источнику при приближении
 */

 // var bwlevs = residents && spv.filter(residents, 'lev.bwlev');

  const model = diff.bwlev?.getNesting('pioneer')
  if (model) {
    if (fake_spyglass.current_mp_md) {
      _updateAttr(fake_spyglass.current_mp_md, 'mp_has_focus', false)
    }
    const target_md = fake_spyglass.current_mp_md = model

    fake_spyglass.current_mp_bwlev = depth(diff.bwlev, fake_spyglass.current_mp_bwlev)

    _updateAttr(target_md, 'mp_has_focus', true)
    _updateAttr(diff.bwlev, 'mp_has_focus', true)

   // _updateAttr(fake_spyglass, 'show_search_form', !!target_md.state('needs_search_from'));
    _updateAttr(fake_spyglass, 'full_page_need', !!target_md.full_page_need)
    _updateRel(fake_spyglass, 'current_mp_md', target_md)
    _updateRel(fake_spyglass, 'current_mp_bwlev', diff.bwlev)
   //_updateAttr(target_md, 'mp-highlight', false);


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