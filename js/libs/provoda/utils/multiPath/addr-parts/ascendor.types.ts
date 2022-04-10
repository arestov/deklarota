export type RootAscendor = Readonly<{
  type: 'root',
  steps: null,
}>

export type ParentAscendor = Readonly<{
  type: 'parent',
  steps: number,
}>
