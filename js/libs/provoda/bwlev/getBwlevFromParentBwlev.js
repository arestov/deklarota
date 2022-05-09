

export default function getBwlevFromParentBwlev(parent_bwlev, md) {
  // parent_bwlev?
  return parent_bwlev.children_bwlevs_by_pioneer_id[md._provoda_id]
};
