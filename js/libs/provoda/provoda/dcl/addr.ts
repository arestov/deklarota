

// var order = ['zip', 'attr', 'rel', 'route', 'anc'];

export default function(params: {
  zip?: string,
  attr?: string,
  rel?: string,
  route?: string,
  anc?: string
}): string {
  const zip_part = params.zip ? ('@' + params.zip + ':') : ''

  const attr = params.attr ? (zip_part + params.attr) : ''
  const relZip = !attr ? zip_part : ''
  const rel = params.rel ? (relZip + params.rel) : ''

  if (!rel && !attr && zip_part) {
    throw new Error('zip not needed')
  }

  return '< ' + [attr, rel, params.route || '', params.anc || ''].join(' < ')
};
