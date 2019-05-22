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
