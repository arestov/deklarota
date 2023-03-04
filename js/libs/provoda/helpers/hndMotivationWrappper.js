

export default function hndMotivationWrappper(_motivator, fn, context, args, arg) {
  /*
    TODO: use hndMotivationWrappper only for view
    rename hndMotivationWrappper to aliveCheck or something
  */
  if (context.__isView && !context.isAliveFast() && !fn.skipAliveCheck) {
    return
  }

  if (args) {
    fn.apply(context, args)
  } else {
    fn.call(context, arg)
  }

};
