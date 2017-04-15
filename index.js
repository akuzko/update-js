'use strict';

var set = require('lodash.set');

update.with = updateWith;
updateIn.with = updateInWith;
update.in = updateIn;

module.exports = update;

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
  var match = name.match(/^([{\w\d:_-}]+)\.?(.+)?$/);
  var key = match[1], rest = match[2];

  if (isLookupKey(key)) {
    if (!Array.isArray(current)) {
      throw new Error('object lookup available only for existing collections');
    }
    var lookupKey = key;
    key = lookupIndex(current, key);
    if (key === undefined) {
      throw new Error('no object found by ' + lookupKey + '. autocreate is not supported');
    }
  }

  if (current[key] === undefined) {
    if (isLookupKey(rest)) {
      throw new Error('autocreate with lookup path is not supported');
    }
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

function isLookupKey(key) {
  return /{.+}/.test(key);
}

function lookupIndex(collection, key) {
  var terms = key.substring(1, key.length - 1).split(',').map(function(t) {
    return t.split(':');
  });

  for (var i = 0; i < collection.length; i++) {
    if (matches(collection[i], terms)) {
      return i;
    }
  }
}

function matches(object, terms) {
  for (var i = 0; i < terms.length; i++) {
    if (object[terms[i][0]] != terms[i][1]) {
      return false;
    }
  }
  return true;
}
