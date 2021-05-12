import memorize from './memorize'

const splitByDot = memorize(function splitByDot(string) {
  return string.split('.')
})

export default splitByDot
