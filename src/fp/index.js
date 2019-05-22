import _update from '../index';

updateFp.with = updateFpWith;
updateFp.unshift = updateFpUnshift;
updateFp.prepend = updateFpUnshift;
updateFp.shift = updateFpShift;
updateFp.push = updateFpPush;
updateFp.add = updateFpPush;
updateFp.pop = updateFpPop;
updateFp.remove = updateFpRemove;
updateFp.assign = updateFpAssign;
updateFp.del = updateFpDel;

export default function updateFp(...args) {
  return function update(obj) {
    return _update.apply(null, [obj, ...args]);
  };
}

function updateFpWith(...args) {
  return function updateFpWith(obj) {
    return _update.with.apply(null, [obj, ...args]);
  };
}

function updateFpUnshift(...args) {
  return function updateUnshift(obj) {
    return _update.unshift.apply(null, [obj, ...args]);
  };
}

function updateFpShift(...args) {
  return function updateShift(obj) {
    return _update.shift.apply(null, [obj, ...args]);
  };
}

function updateFpPush(...args) {
  return function updatePush(obj) {
    return _update.push.apply(null, [obj, ...args]);
  };
}

function updateFpPop(...args) {
  return function updatePop(obj) {
    return _update.pop.apply(null, [obj, ...args]);
  };
}

function updateFpRemove(...args) {
  return function updateRemove(obj) {
    return _update.remove.apply(null, [obj, ...args]);
  };
}

function updateFpAssign(...args) {
  return function updateAssign(obj) {
    return _update.assign.apply(null, [obj, ...args]);
  };
}

function updateFpDel(...args) {
  return function updateDel(obj) {
    return _update.del.apply(null, [obj, ...args]);
  };
}
