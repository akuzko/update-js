'use strict';

var set = require('lodash.set');

update.with = updateWith;
updateIn.with = updateInWith;
exports.default = update;
exports.updateIn = updateIn;

function updateInWith(obj, name, fn) {
  _update(obj, name, fn);

  return obj;
}

function updateIn(obj, name, value) {
  return updateInWith(obj, name, function(){ return value });
}

function update(obj, name, value) {
  return updateWith(obj, name, function(){ return value });
}

function updateWith(obj, name, fn) {
  var current = shallowCopy(obj);

  return updateInWith(current, name, fn);
}

function _update(current, name, fn) {
  var match = name.match(/^([\w\d]+)\.?(.+)?$/);
  var key = match[1], rest = match[2];

  if (current[key] === undefined) {
    return set(current, name.split('.'), fn());
  }
  if (!rest) {
    return current[key] = fn(current[key]);
  }

  current[key] = shallowCopy(current[key]);
  _update(current[key], rest, fn);
}

function shallowCopy(obj) {
  return Array.isArray(obj) ? [].concat(obj) : Object.assign({}, obj);
}
