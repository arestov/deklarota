let count = 1

const sources = {
  // {zip:'one',                       rel: 'rel.rel.rel', route: '', asc: ''}
  zip_of_rel: count++,

  // {zip:'one', attr: 'path.sub.sub', rel: 'rel.rel.rel', route: '', asc: ''}
  zip_of_attr: count++,

  // {zip:'all', attr: 'path.sub.sub', rel: 'rel.rel.rel', route: '', asc: ''}
  long_attr_of_rel: count++,

  // {           attr: 'path.sub.sub',                   , route: '', asc: ''}
  long_attr_of_attr: count++,

  // {zip:'all', attr: 'path',         rel: 'rel.rel.rel', route: '', asc: ''}
  attr: count++,

  // {zip:'all',                       rel: 'rel.rel.rel', route: '', asc: ''}
  rel: count++,

  rel_of_ascendor: count++,
}

export default sources
