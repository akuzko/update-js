'use strict';

var _update = require('../index');

module.exports = updateFp;

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

function toA(args) {
  return [].slice.call(args);
}

function updateFp() {
  var args = toA(arguments);

  return function update(obj) {
    return _update.apply(null, [obj].concat(args));
  }
}

function updateFpWith() {
  var args = toA(arguments);

  return function updateFpWith(obj) {
    return _update.with.apply(null, [obj].concat(args));
  }
}

function updateFpUnshift() {
  var args = toA(arguments);

  return function updateUnshift(obj) {
    return _update.unshift.apply(null, [obj].concat(args));
  }
}

function updateFpShift() {
  var args = toA(arguments);

  return function updateShift(obj) {
    return _update.shift.apply(null, [obj].concat(args));
  }
}

function updateFpPush() {
  var args = toA(arguments);

  return function updatePush(obj) {
    return _update.push.apply(null, [obj].concat(args));
  }
}

function updateFpPop() {
  var args = toA(arguments);

  return function updatePop(obj) {
    return _update.pop.apply(null, [obj].concat(args));
  }
}

function updateFpRemove() {
  var args = toA(arguments);

  return function updateRemove(obj) {
    return _update.remove.apply(null, [obj].concat(args));
  }
}

function updateFpAssign() {
  var args = toA(arguments);

  return function updateAssign(obj) {
    return _update.assign.apply(null, [obj].concat(args));
  }
}

function updateFpDel() {
  var args = toA(arguments);

  return function updateDel(obj) {
    return _update.del.apply(null, [obj].concat(args));
  }
}
