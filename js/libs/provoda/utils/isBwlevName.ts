const expr = /^bwlev(($)|(\:.+))/

const isBwlevName = (str: string): boolean => {
  return expr.test(str)
}

export default isBwlevName
