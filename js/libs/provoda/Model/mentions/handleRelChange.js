define(function(require) {
'use strict'
var spv = require('spv')
var deliverRelQueryUpdates = require('./deliverRelQueryUpdates')

function handleMentions(self, collection_name, old_value, array) {
  if (old_value != null) {
    handleRemoveMetion(self, collection_name, old_value)
  }

  if (array != null) {
    handleAddMention(self, collection_name, array)
  }

  deliverRelQueryUpdates(self, collection_name)
}



function handleRemoveMetion(mentioner, collection_name, target) {
  if (!Array.isArray(target)) {
    handleRemoveMetionItem(mentioner, collection_name, target)
    return
  }

  for (var i = 0; i < target.length; i++) {
    handleRemoveMetionItem(mentioner, collection_name, target[i])
  }
}

function handleAddMention(mentioner, collection_name, target) {
  if (!Array.isArray(target)) {
    handleAddMetionItem(mentioner, collection_name, target)
    return
  }

  for (var i = 0; i < target.length; i++) {
    handleAddMetionItem(mentioner, collection_name, target[i])
  }
}

function handleRemoveMetionItem(mentioner, collection_name, item) {
  if (item._provoda_id == null) {
    return
  }

  var valueOfSet = item.__mentions_as_rel[collection_name]
  var old_length = valueOfSet.size
  valueOfSet.delete(mentioner)
  if (valueOfSet.size == old_length) {
    return
  }
}

function handleAddMetionItem(mentioner, collection_name, item) {
  if (item._provoda_id == null) {
    return
  }
  if (item.__mentions_as_rel == null) {
    item.__mentions_as_rel = {}
  }
  if (item.__mentions_as_rel[collection_name] == null) {
    item.__mentions_as_rel[collection_name] = new Set()
  }

  var valueOfSet = item.__mentions_as_rel[collection_name]
  var old_length = valueOfSet.size
  valueOfSet.add(mentioner)

  if (valueOfSet.size == old_length) {
    return
  }
}

return handleMentions
})
