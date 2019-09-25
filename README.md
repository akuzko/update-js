update-js
=========

JS object immutability helper

[![build status](https://img.shields.io/travis/akuzko/update-js/master.svg?style=flat-square)](https://travis-ci.org/akuzko/update-js)
[![npm version](https://img.shields.io/npm/v/update-js.svg?style=flat-square)](https://www.npmjs.com/package/update-js)

## Installation

```
npm install --save update-js
```

## Usage

### Basic Usage

```js
import update from 'update-js';

const obj = { foo: { bar: [{ baz: 1 }, { baz: 2 }] }, bak: { barbaz: 1 } };
const upd = update(obj, 'foo.bar.1.baz', 3);
// ^ the same as:
// const upd = { ...obj, foo: { ...obj.foo, bar: [obj.foo.bar[0], { ...obj.foo.bar[1], baz: 3 }] } };

// all of the following is true:
upd.foo.bar[1].baz === 3;
upd                !== obj;
upd.foo            !== obj.foo;
upd.foo.bar        !== obj.foo.bar;
upd.foo.bar[0]     === obj.foo.bar[0];
upd.foo.bar[1]     !== obj.foo.bar[1];
upd.bak            === obj.bak;
```

### Updating Multiple Keys at Once

By passing object instead of string path you can update multiple values with one operation. In this
case object keys are used as paths at which corresponding object values should be assigned.

```js
const obj = { foo: { bar: 'baz' }, baz: [{ bak: 'foo' }] };
const upd = update(obj, {
  'foo.bar': 'baz2',
  'foo.baz.0.bak': 'foo2'
});

upd.foo.bar // => 'baz2'
upd.foo.baz[0].bak // => 'foo2'
```

#### Using Helper Methods in Multi-Keys Updates

You can also use [helper methods](#helper-methods) when updating multiple keys at once. When
calling them, you just have to omit first two `obj` and `path` arguments:

```js
const obj = { foo: true, bar: { baz: [1, 2], bak: [{ a: 'a1' }, { a: 'a2' }] } };
const upd = update(obj, {
  foo: false,
  'bar.baz': update.push(3),
  'bar.bak.{a:a2}': update.assign({ b: 'b2' })
});

upd // => { foo: false, bar: { baz: [1, 2, 3], bak: [{ a: 'a1' }, { a: 'a2', b: 'b2' }] } }
```

### Using Custom Updater Function

You can use `update.with` function that accepts updater function instead of value.
The current value at the path is passed as only argument to this function:

```js
const obj = { foo: { bar: [1, 2, 3, 4] }, bak: { barbaz: 1 } };
const upd = update.with(obj, 'foo.bar', (old) => old.filter(i => i % 2 === 0));

upd.foo.bar // => [2, 4]
```

Be careful not to update old object in place when using updater function.

### Using Object Lookup Keys

Lookup keys are used to index objects in array by their property values. For example:

```js
import update from 'update-js';

const obj = {
  foo: {
    items: [
      { id: 1, bar: 2 },
      { id: 2, bar: 3 },
      { id: 3, bar: 4 }
    ]
  }
}
const upd = update(obj, 'foo.items.{id:2}.bar', 5);

upd.foo.items[1].bar === 5 // true
```

Notes on object lookup:
- Object auto-generation is not supported when using path with object lookup,
  i.e. both collection and object specified by lookup key should exist. If
  no object exists, update action will be ignored.
- Lookup should be used with simple values since it uses `==` comparison.
- It is possible to specify several lookup fields, like `{type:foo,name:bar}`.

#### Handling Missing Objects

When `update` encounters lookup key that doesn't correspond to any object in
collection, it invokes `update.onLookupMissingObject` handler, passing collection
and lookup key to that function. There may be different strategies for handling
such cases, depending on execution environment and your needs.

`update-js` provides 3 predefined handlers, available from `update-js/utils`:

```js
import update from 'update-js';
import { warnOnMissing, throwOnMissing, noop } from 'update-js/utils';

update.onLookupMissingObject = warnOnMissing;
// ^ this will `console.warn` message regarding attempt to update missing object

update.onLookupMissingObject = throwOnMissing;
// ^ this will throw exception on attempt to update missing object

update.onLookupMissingObject = noop;
// ^ this will ignore attempt entirely
```

The default value for `update.onLookupMissingObject` is `noop`.

## `update-js/fp` Module

Aside from main functionality of `update` function, `update-js` also provides `update-js/fp` module.
The `updateFp` function imported from it generates a transformation-currying function that accepts
a subject of update as it's only argument. It can be used as a callback for some state-updater
function. For example, one may have something like:

```js
import update from 'update-js/fp';

setState(update('foo.bar.baz', 5));
// ^ with `update` from 'update-js' it is the same as:
// setState((state) => {
//   return update(state, 'foo.bar.baz', 5);
// });
```

`updateFp` function has the same helper methods as it's `update` counterpart, for example:

```js
import update from 'update';
import updateFp from 'update/fp';

update.add(state, 'list.items', obj);
// ^ the same as:
updateFp.add('list.items', obj)(state);
```

**NOTE:** if you want to use update helpers in multi-key updates, you have to use the ones
provided by base `update` package.

## Helper Methods

### Array Update Helpers

#### `update.unshift`

Adds item to the array at the beginning of it.

```js
import update from 'update-js';

const obj = { foo: { bar: [1, 2] } };
const upd = update.unshift(obj, 'foo.bar', 3);

upd.foo.bar // => [3, 1, 2];
```

_Alias:_ `update.prepend`

#### `update.push`

Adds item to the array.

```js
import update from 'update-js';

const obj = { foo: { bar: [1, 2] } };
const upd = update.push(obj, 'foo.bar', 3);

upd.foo.bar // => [1, 2, 3];
```

_Alias:_ `update.add`

#### `update.remove`

Removes item from the array by index or lookup key.

```js
import update from 'update-js';

const obj = { foo: { bar: [1, 2, 3, 4] } };
const upd = update.remove(obj, 'foo.bar.1');

upd.foo.bar // => [1, 3, 4];
```

With lookup key:

```js
const obj = {
  foo: {
    items: [
      { id: 1, bar: 2 },
      { id: 2, bar: 3 },
      { id: 3, bar: 4 }
    ]
  }
}
const upd = update.remove(obj, 'foo.items.{id:2}');

upd.foo.items // => [{ id: 1, bar: 2 }, { id: 3, bar: 4 }]
```

Note that this helper cannot be used to remove item from array if the latter is used as
target object, i.e. `update.remove(obj, '1')` won't work.

### Object Update Helpers

#### `update.assign`

Assigns properties of the given object to the one specified by the path.

```js
import update from 'update-js';

const obj = { foo: { bar: { baz: 'bak' } } };
const upd = update.assign(obj, 'foo.bar', { bak: 'baz' });

upd.foo.bar // => { baz: 'bak', bak: 'baz' };
```

#### `update.del`

Deletes object property at specified path.

```js
import update from 'update-js';

const obj = { foo: { bar: { baz: 'bak', bak: 'baz' } } };
const upd = update.del(obj, 'foo.bar.baz');

upd.foo.bar // => { bak: 'baz' };
```

Note that this helper cannot be used to delete property for target object itself,
i.e. `update.del(obj, 'foo')` won't work.

## Credits

- [Aleksandr Zhukov](https://github.com/AleksandrZhukov) - Opening issues,
  feature suggestions and contributions.

## License

MIT
