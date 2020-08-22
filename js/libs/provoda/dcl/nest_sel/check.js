
import checkPrefix from '../../StatesEmitter/checkPrefix'
import depricateItem from '../depricateItem'

var checkNestSel = checkPrefix('nest_sel-', depricateItem('use rels.sel'), '_chi_nest_sel')

export default checkNestSel
