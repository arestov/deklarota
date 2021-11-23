
import checkPrefix from '../../StatesEmitter/checkPrefix'
import depricateItem from '../depricateItem'

const checkNestSel = checkPrefix('nest_sel-', depricateItem('use rels.sel'), '_chi_nest_sel')

export default checkNestSel
