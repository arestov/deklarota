import memorize from './memorize'

const splitByDot = memorize(function splitByDot(string: string) {
  return string.split('.')
})

export default splitByDot
