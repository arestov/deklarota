

export default function hndMotivationWrappper(_motivator, fn, context, args, arg) {
  if (this.isAliveFast && !this.isAliveFast() && !fn.skipAliveCheck) {
    return
  }

  if (args) {
    fn.apply(context, args)
  } else {
    fn.call(context, arg)
  }

};
