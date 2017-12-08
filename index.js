'use strict';

var set = require('lodash.set');

update.with = updateWith;
update.unshift = updateUnshift;
update.prepend = updateUnshift;
update.shift = updateShift;
update.push = updatePush;
update.add = updatePush;
update.pop = updatePop;
update.remove = updateRemove;
update.assign = updateAssign;
update.del = updateDel;
updateIn.with = updateInWith;
update.in = updateIn;

module.exports = update;

function updateInWith(obj, path, fn) {
  if (typeof path === 'object') {
    Object.keys(path).forEach(function(updatePath) {
      updateInWith(obj, updatePath, function(){ return path[updatePath] });
    });
  } else {
    _update(obj, path, fn);
  }

  return obj;
}

function updateIn(obj, path, value) {
  return updateInWith(obj, path, function(){ return value });
}

function update(obj, path, value) {
  return updateWith(obj, path, function(){ return value });
}

function updateWith(obj, path, fn) {
  var current = shallowCopy(obj);

  return updateInWith(current, path, fn);
}

function updateUnshift(obj, path, item) {
  return updateWith(obj, path, function(collection) {
    return [item].concat(collection);
  });
}

function updateShift(obj, path) {
  return updateWith(obj, path, function(collection) {
    return collection.slice(1);
  });
}

function updatePush(obj, path, item) {
  return updateWith(obj, path, function(collection) {
    return collection.concat([item]);
  });
}

function updatePop(obj, path) {
  return updateWith(obj, path, function(collection) {
    return collection.slice(0, -1);
  });
}

function updateRemove(obj, path) {
  var match = path.match(/^(.+)\.(?!\.)(.+)$/);

  if (match) {
    var collectionPath = match[1], key = match[2], index = key;

    return updateWith(obj, collectionPath, function(collection) {
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

  return obj;
}

function updateAssign(obj, path, object) {
  return updateWith(obj, path, function(old) {
    return Object.assign({}, old, object);
  });
}

function updateDel(obj, path) {
  var match = path.match(/^(.+)\.(?!\.)?(.+)$/);
  var objPath = match[1], key = match[2];

  return updateWith(obj, objPath, function(value) {
    var upd = shallowCopy(value);

    delete upd[key];
    return upd;
  });
}

function _update(current, path, fn) {
  var match = path.match(/^([{\w\d:_\-}]+)\.?(.+)?$/);
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
    return set(current, path.split('.'), fn());
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
