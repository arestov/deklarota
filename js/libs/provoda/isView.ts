type RuntimeView = {view_id: number}
type RuntimeModel = {_node_id: number, view_id: never}

export const isView = (self: RuntimeView | RuntimeModel): boolean => {
  return Boolean(self.view_id)
}
