

export default function hndMotivationWrappper(motivator, fn, context, args, arg) {
  if (this.isAliveFast && !this.isAliveFast() && !fn.skipAliveCheck) {
    return
  }

  //устанавливаем мотиватор конечному пользователю события
  const ov_c = context.current_motivator
  context.current_motivator = motivator

  let ov_t

  if (this != context) {
    //устанавливаем мотиватор реальному владельцу события, чтобы его могли взять вручную
    //что-то вроде api
    ov_t = this.current_motivator
    this.current_motivator = motivator
  }

  if (args) {
    fn.apply(context, args)
  } else {
    fn.call(context, arg)
  }

  if (context.current_motivator != motivator) {
    throw new Error('wrong motivator') //тот кто поменял current_motivator должен был вернуть его обратно
  }
  context.current_motivator = ov_c

  if (this != context) {
    if (this.current_motivator != motivator) {
      throw new Error('wrong motivator') //тот кто поменял current_motivator должен был вернуть его обратно
    }
    this.current_motivator = ov_t
  }
};
