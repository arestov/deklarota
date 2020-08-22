function makeDepricator(message) {
  return function(data, more) {
    console.log(data, more)
    throw new Error(message)
  }
}

export default makeDepricator
