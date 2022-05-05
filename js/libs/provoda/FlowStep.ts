class FlowStep {
  callFlowStep: Function
  aborted: boolean
  p_space: string
  p_index_key: string
  is_transaction_end: boolean
  num: number | null
  fn: Function | null | number
  context: unknown | null
  args: null | unknown | unknown[]
  arg: null | unknown
  cb_wrapper: Function | null | number
  real_context: unknown | null
  finup: boolean
  complex_order: number[]
  inited_order: number[]
  init_end: boolean
  next: FlowStep | null
  constructor(callFlowStep: Function, is_transaction_end: boolean, num: number, complex_order: number[], inited_order: number[], fn: Function, context: unknown, args: string | unknown[], arg: null, cb_wrapper: null, real_context: undefined, finup: undefined, init_end: undefined) {
    this.callFlowStep = callFlowStep
    this.aborted = false
    this.p_space = ''
    this.p_index_key = ''
    this.is_transaction_end = Boolean(is_transaction_end)
    this.num = 1 // just hint type for engine
    this.num = num
    this.fn = Function.prototype // just hint type for engine
    this.fn = fn
    this.context = Object.prototype
    this.context = context

    this.args = Array.prototype
    this.arg = Object.prototype

    if (args && args.length > 1) {
      if (arg) {
        throw new Error('only args or arg should be provide')
      }

      this.args = args
      this.arg = null
    } else if (args) {
      this.args = null
      this.arg = args[0]
    } else {
      this.args = null
      this.arg = (arg == null) ? null : arg
    }

    this.cb_wrapper = Function.prototype // just hint type for engine
    this.cb_wrapper = cb_wrapper || null

    this.real_context = Object.prototype
    this.real_context = real_context
    this.finup = !!finup

    this.complex_order = Array.prototype
    this.complex_order = complex_order

    this.inited_order = Array.prototype
    this.inited_order = inited_order

    this.init_end = Boolean(init_end)

    this.next = FlowStep.prototype
    this.next = null

    if (this.fn == null && this.cb_wrapper == null) {
      throw new Error('how to handle this step!?')
    }

    Object.seal(this)
    //this.custom_order = null;
  }
  abort(): void {
    this.aborted = true
    this.num = null
    this.fn = null
    this.context = null
    this.args = null
    this.arg = null
    this.cb_wrapper = null
    this.real_context = null
    //this.complex_order = null;
  }
  call(): void {
    const { callFlowStep } = this
    callFlowStep(this)
  }
}
export default FlowStep
