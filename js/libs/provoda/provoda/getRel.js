

export default function getNesting(md, collection_name) {
  if (md == null) {
    console.error(new Error(`Couldn't read "${collection_name}" rel from ${md}.`))
    return undefined
  }

  if (md.is_messaging_model) {
    return md.getRel(collection_name)
  }
  return md.children_models && md.children_models[collection_name]
};
