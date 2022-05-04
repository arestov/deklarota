export const addRequestToRequestsManager = (related_owner, req, type, dcl, api) => {
  if (!type) {
    /*
      // changes -> state: input
      // state -> changes (dom, <img onload>, data send, etc): output
    */
    throw new Error('type (input/output) should be provived')
  }
  related_owner.getStrucRoot().getInterface('requests_manager')?.addRequest(req, related_owner, type, dcl, api)
}

export const considerOwnerAsImportantForRequestsManager = (related_owner) => {
  related_owner.getStrucRoot().getInterface('requests_manager')?.considerOwnerAsImportant(related_owner)
}

export const stopRequests = (related_owner) => {
  related_owner.getStrucRoot().getInterface('requests_manager')?.stopRequests(related_owner)
}
