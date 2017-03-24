update
======

JS object immutability helper

## Installation

```
npm install --save update
```

## Usage

```js
import update from 'update';

const obj = { foo: { bar: [{ baz: 1 }, { baz: 2 }] }, bak: { barbaz: 1 } };
const upd = update(obj, 'foo.bar.1.baz', 3);

// all of the following is true:
upd.foo.bar[1].baz === 3;
upd                !== obj;
upd.foo            !== obj.foo;
upd.foo.bar        !== obj.foo.bar;
upd.foo.bar[0]     === obj.foo.bar[0];
upd.foo.bar[1]     !== obj.foo.bar[1];
upd.bak            === obj.bak;

// with user-defined function that takes current value located in
// obj at specified path as only argument
const upd2 = update.with(obj, 'foo.bar.1.baz', (n) => n * 2);
upd2.foo.bar[1].baz === 4 // => true
```

## License

MIT
