

export default function(related_md, id) {
  if (related_md == null) {
    console.error(new Error(`Couldn't read model by id "${id}"  from ${related_md}.`))
    return undefined
  }

  return related_md._highway.models[id]
};
