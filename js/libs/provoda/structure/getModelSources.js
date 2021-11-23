
import spv from '../../spv'
import get_constr from './get_constr'

const collapseAll = spv.collapseAll
const getNestingConstr = get_constr.getNestingConstr


export default function getModelSources(app, md, cur) {
  let states_sources = []
  let i
  const states_list = cur.merged_states
  let unfolded_states = new Array(states_list.length)
  for (i = 0; i < states_list.length; i++) {
    unfolded_states[i] = md.getNonComplexStatesList(states_list[i])
  }

  unfolded_states = collapseAll.apply(null, unfolded_states)

  for (i = 0; i < unfolded_states.length; i++) {
    const state_name = unfolded_states[i]
    const arr = md.getStateSources(state_name, app)
    if (arr) {
      states_sources.push(arr)
    }


  }
  states_sources = collapseAll.apply(null, states_sources)

  let nestings_names_list = []

  let nesting_name
  for (nesting_name in cur.m_children.children_by_mn) {
    nestings_names_list.push(nesting_name)
  }
  for (nesting_name in cur.m_children.children) {
    nestings_names_list.push(nesting_name)
  }

  nestings_names_list = collapseAll(nestings_names_list)

  const nesting_sources = []
  for (i = 0; i < nestings_names_list.length; i++) {
    const source = md.getNestingSource(nestings_names_list[i], app)
    if (source) {
      nesting_sources.push(source)
    }
  }


  let all_nest_sources = []

  for (nesting_name in cur.m_children.children) {
    const items = getNestingConstr(app, md, nesting_name)
    for (const space_name in cur.m_children.children[nesting_name]) {

      var constr_sources
      if (!items) {
        continue
      }
      if (Array.isArray(items)) {
        constr_sources = []
        for (i = 0; i < items.length; i++) {
          const cur_sources = getModelSources(app, items[i].prototype, cur.m_children.children[nesting_name][space_name])
          if (cur_sources.length) {
            constr_sources = constr_sources.concat(cur_sources)
          }
        }
      } else {
        constr_sources = getModelSources(app, items.prototype, cur.m_children.children[nesting_name][space_name])
      }

      if (constr_sources) {
        all_nest_sources = all_nest_sources.concat(constr_sources)
      }
    }

  }





  /*
  a) итерируем по названиям гнезд,
    получаем список или один конструктор для нужного гнезда
    совмещаем данные

  б) итерируем по названиям гнезд
    получаем список или один конструктор для нужного гнезда
    вычленяем по имени модели только используемые конструкторы


  */

  let full_sources_list = states_sources.concat(nesting_sources)
  if (all_nest_sources.length) {
    full_sources_list = full_sources_list.concat(all_nest_sources)
  }
  return collapseAll(full_sources_list)
}
