const slice = Array.prototype.slice;

export function Helper(fn, args) {
  this.fn = fn;
  this.args = slice.call(args);
}

export function createHelper(handler) {
  return function() {
    if (arguments.length < 2) {
      return new Helper(handler, arguments);
    } else {
      const args = slice.call(arguments, 1);
      args.unshift(shallowCopy(arguments[0]));
      return handler.apply(null, args);
    }
  };
}

export function shallowCopy(obj) {
  return Array.isArray(obj) ? [...obj] : { ...obj };
}


// Default helpers for handling lookup key missing object scenario.
// To be used as values assigned to `update.onLookupMissingObject` property.
export function noop() {}

export function warnOnMissing(obj, key) {
  if (typeof console !== undefined) {
    // eslint-disable-next-line no-console, no-undef
    (console.warn || console.log)(`update-js: No object found by ${key}, update ignored. Collection:`, obj);
  }
}

export function throwOnMissing(obj, key) {
  throw new Error(`update-js: No object found by ${key}, autocreate is not supported.`);
}
