import spv from '../../../spv'
import hp from '../../helpers'

const getUnprefixed = spv.getDeprefixFunc('sub_page-')
const hasPrefixedProps = hp.getPropsPrefixChecker(getUnprefixed)

export const depricateOldSubpages = (props) => {
  const changed_singled = hasPrefixedProps(props)
  if (changed_singled) {
    throw new Error('use sub_page: {}, sub_page-*')
  }
}

export default function collectSubpages(self) {
  const changed_pack = self.hasOwnProperty('sub_page')
  if (changed_pack) {
    throw new Error('use routes')
  }
}
