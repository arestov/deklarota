var count = 1

var sources = {
  // {zip:'one',                       rel: 'rel.rel.rel', route: '', asc: ''}
  zip_of_rel: count++,

  // {zip:'one', attr: 'path.sub.sub', rel: 'rel.rel.rel', route: '', asc: ''}
  zip_of_attr: count++,

  // {zip:'all', attr: 'path.sub.sub', rel: 'rel.rel.rel', route: '', asc: ''}
  long_attr: count++,

  // {zip:'all', attr: 'path',         rel: 'rel.rel.rel', route: '', asc: ''}
  attr: count++,

  // {zip:'all',                       rel: 'rel.rel.rel', route: '', asc: ''}
  rel: count++,
}

export default sources
