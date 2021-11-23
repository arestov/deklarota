

export default function getKey(data) {
  const bwlev_key = data.bwlev ? ('-' + data.bwlev) : ''
  const md_key = data.context_md ? ('-' + data.context_md) : ''
  return data.name + bwlev_key + md_key
};
