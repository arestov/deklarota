import getModelFromR from '../../libs/provoda/provoda/v/getModelFromR'

const getBwlevContentFromR = (highway_holder, bwlev_r) => {
  const bwlev = getModelFromR(highway_holder, bwlev_r)
  return bwlev.getNesting('pioneer')
}

export default getBwlevContentFromR
