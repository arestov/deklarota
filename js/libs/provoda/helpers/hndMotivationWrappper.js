

export default function hndMotivationWrappper(_motivator, fn, context, args, arg) {
  if (context.isAliveFast && !context.isAliveFast() && !fn.skipAliveCheck) {
    return
  }

  if (args) {
    fn.apply(context, args)
  } else {
    fn.call(context, arg)
  }

};
