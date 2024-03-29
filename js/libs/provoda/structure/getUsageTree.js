
import spv from '../../spv'
const push = Array.prototype.push

const getTreeSample = function(full_key, key) {
  if (!full_key || !key) {
    throw new Error('full_key and key should be provided')
  }
  return {
    key: key,
    full_key: full_key,
    basetree: null,
    states: {
      stch: [],
      compx_deps: [],
      deep_compx_deps: [],

    },
    constr_children: {
      children: {},
      children_by_mn: {}
    },
    tree_children: {},
    m_children: {},
    children_index: {},
    merged_states: [],
    base_from_parent: null,
    base_root_constr_id: null,
    collch_selectors: {},
    collch_dclrs: {}
  }
}

const bCh = function(_item, nesting_name, nesting_space, children_list_index, children_list) {
  const field_path = ['children', nesting_name, nesting_space]
  if (!children_list_index[field_path.join('{}')]) {
    children_list.push(field_path)
  }
}

const bChByMN = function(_item, nesting_name, model_name, nesting_space, children_list_index, children_list) {
  const field_path = ['children_by_mn', nesting_name, model_name, nesting_space]
  if (!children_list_index[field_path.join('{}')]) {
    children_list.push(field_path)
  }
}

const iterateChildren = function(children, cb, arg1, arg2) {
  for (const nesting_name in children) {
    for (const nesting_space in children[nesting_name]) {
      cb(children[nesting_name][nesting_space], nesting_name, nesting_space, arg1, arg2)
    }
  }
}
const iterateChildrenByMN = function(children_by_mn, cb, arg1, arg2) {
  for (const nesting_name in children_by_mn) {
    for (const model_name in children_by_mn[nesting_name]) {
      for (const nesting_space in children_by_mn[nesting_name][model_name]) {
        cb(children_by_mn[nesting_name][model_name][nesting_space], nesting_name, model_name, nesting_space, arg1, arg2)
      }
    }
  }
}

function mutateTreeStoreForChild(tree, store, path, struc) {
  spv.setTargetField(store, path, struc)
  spv.setTargetField(tree.m_children, path, struc)
  tree.children_index[struc.full_key.join('.')] = struc

  spv.cloneObj(tree.children_index, struc.children_index)
}

const buildFreeChildren = function(tree, base_from_parent, base_root_constr_id) {
  const used_base = base_from_parent
  const children_list_index = {}
  const children_list = []
  if (used_base) {
    if (used_base.children) {
      iterateChildren(used_base.children, bCh, children_list_index, children_list)
    }
    if (used_base.children_by_mn) {
      iterateChildrenByMN(used_base.children_by_mn, bChByMN, children_list_index, children_list)
    }

  }
  if (base_from_parent && base_from_parent.states) {
    tree.merged_states = spv.collapseAll(tree.merged_states, base_from_parent.states)
  }
  for (let i = 0; i < children_list.length; i++) {
    const cur = children_list[i]

    const parent_basetree_chi = tree.basetree ? spv.getTargetField(tree.basetree, cur) : (base_from_parent && spv.getTargetField(base_from_parent, cur))

    const struc = getTreeSample(tree.full_key.concat(cur), cur)

    mutateTreeStoreForChild(tree, tree.tree_children, cur, struc)
    buildFreeChildren(struc, parent_basetree_chi, base_root_constr_id)
    struc.base_from_parent = parent_basetree_chi
    struc.base_root_constr_id = base_root_constr_id



    if (!base_root_constr_id) {
      //debugger;
    }
  }
}

const getUsageTree = function(full_key, key, cur_view, root_view, base_from_parent, base_root_constr_id) {
  /*
  - collch
  - dk-view внутри .tpl
  - dk-view внутри .tpl нераскрытые

  */

  /*
  {
    stch
    состояния-источники для compx
    свои состояния как состояния-источники для compx внутри потомков
    используемые в шаблоне состояния (tpl, tpls, base_tree)

    шаблон, который задекларирован у потомка или шаблон, который родитель сам передаст потомку
  }
  */

  /*
  собираем состояния из контроллера
  1) stch_hs
  2)  full_comlxs_list
  */
  const tree = getTreeSample(full_key, key)

    // debugger;

  for (const dclr_name in cur_view.dclrs_fpckgs) {
    const dclrs = cur_view.dclrs_fpckgs[dclr_name]
    if (dclrs.solving) {
      tree.collch_dclrs[dclr_name] = dclrs.solving
    }
  }

  tree.collch_selectors = cur_view.dclrs_selectors || null

  tree.states.stch = (cur_view.stch_hs_list && cur_view.stch_hs_list.slice()) || []
  tree.states.compx_deps = getCompxDeps(cur_view)
  tree.merged_states = spv.collapseAll(tree.states.stch, tree.states.compx_deps)
  tree.basetree = getBaseTree(cur_view, root_view)

  if (tree.basetree && tree.basetree.states) {
    tree.merged_states = spv.collapseAll(tree.merged_states, tree.basetree.states)
  }

  //создаём список для итерации по потомкам
  //могут быть и basetree и конструкторы для одного nest и space а может быть только basetree или только конструктор
  //нужно использовать всё

  const children_list_index = {}
  const children_list = []

  if (cur_view.children_views) {
    iterateChildren(cur_view.children_views, bCh, children_list_index, children_list)
  }

  if (cur_view.children_views_by_mn) {
    iterateChildrenByMN(cur_view.children_views_by_mn, bChByMN, children_list_index, children_list)
  }

  const used_base = tree.basetree || base_from_parent

  if (used_base) {
    if (used_base.children) {
      iterateChildren(used_base.children, bCh, children_list_index, children_list)
    }
    if (used_base.children_by_mn) {
      iterateChildrenByMN(used_base.children_by_mn, bChByMN, children_list_index, children_list)
    }
  }

  if (base_from_parent && base_from_parent.children) {
    //debugger;
  }

  const own_children = {
    children: cur_view.children_views,
    children_by_mn: cur_view.children_views_by_mn
  }

  for (let i = 0; i < children_list.length; i++) {
    const cur = children_list[i]

    //var basetree = tree.basetree &&  spv.getTargetField(tree.basetree, cur);
    let parent_basetree_chi
    let chi_constr_id

    const base_tree_chi = tree.basetree && spv.getTargetField(tree.basetree, cur)
    if (tree.basetree) {
      parent_basetree_chi = base_tree_chi
      chi_constr_id = cur_view.constr_id
    } else {
      parent_basetree_chi = base_from_parent && spv.getTargetField(base_from_parent, cur)
      chi_constr_id = base_root_constr_id
    }

    const constr = (parent_basetree_chi && parent_basetree_chi.controller_name)
      ? root_view.controllers[parent_basetree_chi.controller_name]
      : spv.getTargetField(own_children, cur)

    if (constr) {
      const struc = getUsageTree(full_key.concat(cur), cur, constr.prototype, root_view, parent_basetree_chi, parent_basetree_chi && chi_constr_id)
      mutateTreeStoreForChild(tree, tree.constr_children, cur, struc)

    } else if (parent_basetree_chi) {
      const struc = getTreeSample(full_key.concat(cur), cur)
      mutateTreeStoreForChild(tree, tree.tree_children, cur, struc)
      buildFreeChildren(struc, parent_basetree_chi, parent_basetree_chi && chi_constr_id)
      struc.base_from_parent = parent_basetree_chi
      struc.base_root_constr_id = chi_constr_id
      //getTreeSample
    }
  }
  tree.base_from_parent = base_from_parent || null
  tree.base_root_constr_id = base_root_constr_id || null

  if (tree.base_from_parent && tree.base_from_parent.states) {
    tree.merged_states = spv.collapseAll(tree.merged_states, tree.base_from_parent.states)
  }

  return tree
}


function getCompxDeps(cur_view) {
  if (!cur_view.full_comlxs_list) {
    return []
  }

  const result = []

  const compxs_itself = []

  for (let i = 0; i < cur_view.full_comlxs_list.length; i++) {
    push.apply(result, cur_view.full_comlxs_list[i].depends_on)
    compxs_itself.push(cur_view.full_comlxs_list[i].name)
  }

  return spv.collapseAll(spv.arrayExclude(result, compxs_itself))

}

const setUndefinedField = function(store, field_path, value) {
  const current_value = spv.getTargetField(store, field_path)
  if (!current_value) {
    spv.setTargetField(store, field_path, value)
  }
}

function getBaseTree(cur_view, root_view) {
  if (!cur_view.base_tree_list) {
    return null
  }

  const merged_tree = {
    node_id: null,
    children: null,
    children_by_mn: null,
    states: null,
    controller_name: null
  }

  let i
  let cur
  const arr = []

  for (i = 0; i < cur_view.base_tree_list.length; i++) {
    cur = cur_view.base_tree_list[i]


    const sample_name = cur.sample_name

    if (!sample_name) {
      throw new Error('can\'t get sampler')
    }
    const sampler = root_view.getSampler(sample_name)

    const structure_data = sampler.getStructure(cur.parse_as_tplpart)

    if (!merged_tree.controller_name) {
      merged_tree.controller_name = structure_data.controller_name
    }

    arr.push(structure_data)
    //cur_view.structure_data

  }

  let nesting_name
  let nesting_space
  let field_path
  let model_name

  const tree_id = []

  for (i = 0; i < arr.length; i++) {
    cur = arr[i]
    tree_id.push(cur.node_id)
    if (cur.states) {
      if (!merged_tree.states) {
        merged_tree.states = []
      }
      push.apply(merged_tree.states, cur.states)
    }

    if (cur.children) {
      if (!merged_tree.children) {
        merged_tree.children = {}
      }
      for (nesting_name in cur.children) {
        for (nesting_space in cur.children[nesting_name]) {
          field_path = [nesting_name, nesting_space]
          setUndefinedField(merged_tree.children, field_path, spv.getTargetField(cur.children, field_path))
        }
      }
    }

    if (cur.children_by_mn) {
      if (!merged_tree.children_by_mn) {
        merged_tree.children_by_mn = {}
      }
      for (nesting_name in cur.children_by_mn) {
        if (!merged_tree.children_by_mn[nesting_name]) {
          merged_tree.children_by_mn[nesting_name] = {}
        }
        for (model_name in cur.children_by_mn[nesting_name]) {
          for (nesting_space in cur.children_by_mn[nesting_name][model_name]) {
            field_path = [nesting_name, model_name, nesting_space]
            setUndefinedField(merged_tree.children_by_mn, field_path, spv.getTargetField(cur.children_by_mn, field_path))
          }
        }
      }
    }
  }
  merged_tree.node_id = tree_id.join('&')
  return merged_tree



}

export default getUsageTree
