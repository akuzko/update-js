import set from 'lodash.set';
import { isLookupKey, lookupIndex } from 'get-lookup';
import { Helper, createHelper, shallowCopy, noop } from './utils';

update.in = updateIn;
updateIn.with = updateInWith;
update.onLookupMissingObject = noop;

export default function update(obj, path, value) {
  return update.with(obj, path, () => value);
}

function updateInWith(obj, path, fn) {
  if (typeof path === 'object') {
    Object.keys(path).forEach((updatePath) => {
      const value = path[updatePath];

      if (value instanceof Helper) {
        value.fn.apply(null, [obj, updatePath, ...value.args]);
      } else {
        updateInWith(obj, updatePath, () => path[updatePath]);
      }
    });
  } else {
    _update(obj, path, fn);
  }

  return obj;
}

function updateIn(obj, path, value) {
  return updateInWith(obj, path, () => value);
}

update.with = createHelper((obj, path, fn) => {
  return updateInWith(obj, path, fn);
});

update.unshift = createHelper((obj, path, item) => {
  return updateInWith(obj, path, (collection) => {
    return [item, ...collection];
  });
});

update.prepend = update.unshift;

update.shift = createHelper((obj, path) => {
  return updateInWith(obj, path, (collection) => {
    return collection.slice(1);
  });
});

update.push = createHelper((obj, path, item) => {
  return updateInWith(obj, path, (collection) => {
    return [...collection, item];
  });
});

update.add = update.push;

update.pop = createHelper((obj, path) => {
  return updateInWith(obj, path, (collection) => {
    return collection.slice(0, -1);
  });
});

update.remove = createHelper((obj, path) => {
  const match = path.match(/^(.+)\.(?!\.)(.+)$/);

  if (match) {
    const [_match, collectionPath, key] = match;

    return updateInWith(obj, collectionPath, (collection) => {
      const index = isLookupKey(key) ? lookupIndex(collection, key) : parseInt(key);

      if (index > -1) {
        return collection.slice(0, index).concat(collection.slice(index + 1));
      }

      return collection;
    });
  }

  return obj;
});

update.assign = createHelper((obj, path, object) => {
  return updateInWith(obj, path, (old) => {
    return { ...old, ...object };
  });
});

update.del = createHelper(function(obj, path) {
  const [_match, objPath, key] = path.match(/^(.+)\.(?!\.)?(.+)$/);

  return updateInWith(obj, objPath, (value) => {
    const { [key]: _toRemove, ...rest } = value;

    return rest;
  });
});

function _update(current, path, fn) {
  const [_match, key, rest] = path.match(/^([^.]+)\.?(.+)?$/);
  const isLookup = isLookupKey(key);
  let keyIndex = key;

  if (isLookup) {
    if (!Array.isArray(current)) {
      throw new Error('object lookup available only for existing collections');
    }

    keyIndex = lookupIndex(current, key);

    if (keyIndex === -1) {
      update.onLookupMissingObject(current, key);

      return current;
    }
  }

  if (current[keyIndex] === undefined) {
    if (isLookupKey(rest)) {
      throw new Error('autocreate with lookup path is not supported');
    }
    return set(current, path.split('.'), fn());
  }
  if (!rest) {
    return current[keyIndex] = fn(current[keyIndex]);
  }

  current[keyIndex] = shallowCopy(current[keyIndex]);
  _update(current[keyIndex], rest, fn);
}
