

// import selecPoineertDeclr from '../../libs/provoda/structure/selecPoineertDeclr'

const bhv = {
  'stch-used_struc': function(self, value) {
    self.RPCLegacy('updateState', 'used_struc', value)
  },
  attrs: {
    'view_path': [
      'comp',
      ['_provoda_id'],
      function() {
        return getViewPath(this).join('.')
      }
    ],
    'used_struc': [
      'comp',
      ['< view_structure <<< #', 'view_path'],
      function(view_structure, view_path) {
        if (!view_structure || !view_path) {
          return
        }

        return view_structure.children_index[view_path]
      }
    ]
  }
}


function getKey(cur, by_model_name) {
  return by_model_name
    ? ['children_by_mn', cur.nesting_name, cur.mpx.md.model_name, cur.nesting_space]
    : ['children', cur.nesting_name, cur.nesting_space]
}

function getViewPath(view) {
  let cur = view

  const path = []

  while (cur) {
    if (!cur.root_view || cur === cur.root_view) {
      break
    }

    // var dcl = getDcl(cur);
    // console.log('dcl!!!', dcl)

    const key = getKey(cur, cur.by_model_name)
    path.unshift.apply(path, key)

    cur = cur.parent_view

  }

  return path
}

export default {
  bhv: bhv,
}
