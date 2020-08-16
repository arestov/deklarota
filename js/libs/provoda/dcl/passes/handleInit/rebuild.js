

export default function rebuild(self, index) {
  if (!index.hasOwnProperty('handleInit')) {
    self.__handleInit = null
    return
  }

  self.__handleInit = index.handleInit
};
