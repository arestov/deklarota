

export default function getBwlevFromParentBwlev(parent_bwlev, md) {
  // parent_bwlev?
  return parent_bwlev.children_bwlevs[md._provoda_id]
};
