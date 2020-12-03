import relShape from '../relShape'

function NestInput(name, data) {
  this.rel_name = name
  this.rel_shape = relShape(data[1])
}


export default NestInput
