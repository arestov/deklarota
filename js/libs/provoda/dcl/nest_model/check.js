
import checkPrefix from '../../AttrsOwner/checkPrefix'
import depricateItem from '../depricateItem'

const checkNestRqC = checkPrefix('nest_rqc-', depricateItem('use rels.model'), '__nest_rqc')

export default checkNestRqC
