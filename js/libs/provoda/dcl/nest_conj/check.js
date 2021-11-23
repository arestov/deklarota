
import checkPrefix from '../../StatesEmitter/checkPrefix'
import depricateItem from '../depricateItem'

const checkApi = checkPrefix('nest_conj-', depricateItem('use rels.conj'), '_chi_nest_conj')

export default checkApi
