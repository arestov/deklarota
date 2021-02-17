

export default function(related_md, id) {
  if (related_md == null) {
    console.error(new Error(`Couldn't read model by id "${id}"  from ${related_md}.`))
    return undefined
  }

  if (related_md.is_messaging_model) {
    return related_md.__getModelById(id)
  }
  return related_md._highway.models[id]
};
