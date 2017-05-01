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

### Using Custom Updater Function

You can use `update.with` function that accepts updater function instead of value.
The current value at the path is passed as only argument to this function:

```js
const obj = { foo: { bar: [1, 2, 3, 4] }, bak: { barbaz: 1 } };
const upd = update.with(obj, 'foo.bar', (old) => old.filter(i => i % 2 === 0));

upd.foo.bar // => [2, 4]
```

Be careful not to update old object in place when using updater function.

### Using Object Lookup Feature

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
- object auto-generation is not supported when using path with object lookup, i.e. both collection and object specified by lookup key should exist
- lookup should be used with simple values since it uses `==` comparison
- it is possible to specify several lookup fields, like `{id:2,name:foo}`

### Collection Helpers

### `update.add`

```js
import update from 'update-js';

const obj = { foo: { bar: [1, 2] } };
const upd = update.add(obj, 'foo.bar', 3);

upd.foo.bar // => [1, 2, 3];
```

### `update.remove`

```js
import update from 'update-js';

const obj = { foo: { bar: [1, 2, 3, 4] } };
const upd = update.remove(obj, 'foo.bar.1');

upd.foo.bar // => [1, 3, 4];
```

`update.remove` also supports element removal with lookup key:

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

## License

MIT
