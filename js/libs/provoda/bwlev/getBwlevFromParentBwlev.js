import getModelById from '../utils/getModelById'


export default function getBwlevFromParentBwlev(parent_bwlev, md) {
  // parent_bwlev?
  return getModelById(parent_bwlev, parent_bwlev.getAttr('children_bwlevs_by_pioneer_id')[md._provoda_id])
};
