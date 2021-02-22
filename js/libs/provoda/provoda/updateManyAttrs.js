

export default function(md, attrs) {
  if (md == null) {
    console.error(new Error(`Couldn't update "${Object.keys(attrs)}" attrs in ${md}.`))
    return undefined
  }
  return md.updateManyStates(attrs)
};
