// Exports from dkt
export { default as getAttr } from './libs/provoda/provoda/getAttr'
export { default as updateAttr } from './libs/provoda/provoda/updateAttr'
export { default as inputAttrs } from './libs/provoda/provoda/dcl/attrs/input'

export { default as getNesting } from './libs/provoda/provoda/getNesting'
export { default as getRel } from './libs/provoda/provoda/getRel'
export { default as updateRel } from './libs/provoda/provoda/updateRel'

export { default as bhv } from './libs/provoda/provoda/bhv'
export { default as mergeBhv } from './libs/provoda/provoda/dcl/merge'
export { default as appRoot } from './libs/provoda/provoda/appRoot'
export { default as getModelById } from './libs/provoda/provoda/getModelById'
export { default as initView } from './libs/provoda/provoda/runtime/view/start'
export { default as prepareAppRuntime } from './libs/provoda/provoda/runtime/view/prepare'

export { default as LoadableList } from './libs/provoda/provoda/LoadableList'
export { default as View } from './libs/provoda/provoda/View'
export { default as CoreView } from './libs/provoda/provoda/CoreView'
export { default as SyncReceiver } from './libs/provoda/provoda/SyncReceiver'

// Exports from dkt-all
// TODO: maybe export them in separate library to reduce bundle size?
export { default as spv } from './libs/spv'

export { default as initBrowsing } from './initBrowsing'
export { default as getAncestorByRooViCon } from './views/map_slice/getAncestorByRooViCon'
export { default as getMapSliceView } from './views/map_slice/getMapSliceView'
export { default as getUsageTree } from './libs/provoda/structure/getUsageTree'
export { default as getSPByPathTemplate } from './libs/provoda/routes/legacy/getSPByPathTemplate'
export { default as changeBridge } from './libs/provoda/bwlev/changeBridge'
export { default as showMOnMap } from './libs/provoda/bwlev/showMOnMap'
export { default as route } from './modules/route'

export { default as AppBaseView } from './views/AppBaseView'
export { default as MapSliceSpyglassCore } from './views/map_slice/MapSliceSpyglassCore'
export { default as BrowseLevViewCore } from './views/map_slice/BrowseLevViewCore'
export { default as BrowseLevel } from './libs/provoda/bwlev/BrowseLevel'
export { default as RouterCore } from './models/Router'
export { default as BrowseMap } from './libs/BrowseMap'
export { default as FuncsQueue } from './libs/FuncsQueue'
