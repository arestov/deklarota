/* eslint-disable no-use-before-define */

export type ModelConstr = {
  prototype: ModelProto
}

type RootConstr = ModelConstr & {
  prototype: ModelProto & {
    start_page: ModelProto
  }
}

export type ModelProto = {
  RootConstr: RootConstr
  _parent_constr: ModelConstr
  _all_chi: {
    [key: string]: ModelConstr
  }
}
