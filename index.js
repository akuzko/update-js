'use strict';

var set = require('lodash.set');

update.with = updateWith;
update.add = updateAdd;
update.remove = updateRemove;
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

function updateAdd(obj, name, item) {
  return updateWith(obj, name, function(collection) {
    return collection.concat([item]);
  });
}

function updateRemove(obj, name) {
  var match = name.match(/^(.+)\.(?!\.)(.+)$/);

  if (match) {
    var path = match[1], key = match[2], index = key;

    return updateWith(obj, path, function(collection) {
      if (isLookupKey(key)) {
        index = lookupIndex(collection, key);
      }
      index = parseInt(index);

      if (index > -1) {
        return collection.slice(0, index).concat(collection.slice(index + 1));
      }

      return collection;
    });
  }
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
    if (key === -1) {
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

  return -1;
}

function matches(object, terms) {
  for (var i = 0; i < terms.length; i++) {
    if (object[terms[i][0]] != terms[i][1]) {
      return false;
    }
  }
  return true;
}
