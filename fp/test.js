var update = require('./');
var updatePlain = require('../');
var assert = require('assert');

describe('updateFp', function() {
  it('updates object accoding to path', function() {
    var obj = { foo: { bar: [{ baz: 'baz1' }, { baz: 'baz2' }] }, bak: { big: 1 } };
    var upd = update('foo.bar.1.baz', 'baz3')(obj);

    assert.notStrictEqual(upd, obj);
    assert.strictEqual(upd.foo.bar[0], obj.foo.bar[0]);
    assert.strictEqual(upd.bak, obj.bak);
    assert.deepEqual(upd.foo.bar[1], { baz: 'baz3' });
  });

  describe('updating multiple keys at once with special helpers', function() {
    it('correctly applies `with` helper', function() {
      var obj = { foo: { bar: false, baz: [1, 2] } };
      var upd = update({
        'foo.bar': true,
        'foo.baz': updatePlain.with(baz => baz.map(i => i * 2))
      })(obj);

      assert.equal(upd.foo.bar, true);
      assert.deepEqual(upd.foo.baz, [2, 4]);
    });
  });

  describe('update.with', function() {
    it('sets deeply nested item with setter function', function() {
      var obj = { foo: { bar: { baz: [1, 2, 3] } }, bak: { big: 1 } };
      var upd = update.with('foo.bar.baz.1', function(n){ return n * 2 })(obj);

      assert.equal(upd.foo.bar.baz[1], 4);
    });
  });

  describe('update.unshift', function() {
    it('prepends new item to the collection', function() {
      var obj = { foo: { bar: [1, 2] } };
      var upd = update.unshift('foo.bar', 3)(obj);

      assert.deepEqual(upd.foo.bar, [3, 1, 2]);
    });
  });

  describe('update.prepend', function() {
    it('prepends new item to the collection', function() {
      var obj = { foo: { bar: [1, 2] } };
      var upd = update.prepend('foo.bar', 3)(obj);

      assert.deepEqual(upd.foo.bar, [3, 1, 2]);
    });
  });

  describe('update.push', function() {
    it('adds new item to the collection', function() {
      var obj = { foo: { bar: [1, 2] } };
      var upd = update.push('foo.bar', 3)(obj);

      assert.deepEqual(upd.foo.bar, [1, 2, 3]);
    });
  });

  describe('update.add', function() {
    it('adds new item to the collection', function() {
      var obj = { foo: { bar: [1, 2] } };
      var upd = update.add('foo.bar', 3)(obj);

      assert.deepEqual(upd.foo.bar, [1, 2, 3]);
    });
  });

  describe('update.remove', function() {
    it('removes object from the collection', function() {
      var obj = { foo: { bar: [1, 2, 3, 4] } };
      var upd = update.remove('foo.bar.1')(obj);

      assert.deepEqual(upd.foo.bar, [1, 3, 4]);
    });

    it('removes object from the collection with lookup path', function() {
      var item1 = { id: 1, baz: 2 };
      var item2 = { id: 2, baz: 3 };
      var obj = { foo: { bar: [item1, item2] } };
      var upd = update.remove('foo.bar.{id:2}')(obj);

      assert.deepEqual(upd.foo.bar, [item1]);
      assert.strictEqual(upd.foo.bar[0], item1);
    });
  });

  describe('update.assign', function() {
    it('merges passed object with target one', function() {
      var obj = { foo: { bar: { baz: 'bak' } } };
      var upd = update.assign('foo.bar', { bak: 'barbaz' })(obj);

      assert.deepEqual(upd.foo.bar, { baz: 'bak', bak: 'barbaz' });
    });
  });

  describe('update.del', function() {
    it('removes key from object', function() {
      var obj = { foo: { bar: 'baz', baz: 'bak' } };
      var upd = update.del('foo.bar')(obj);

      assert.deepEqual(upd, { foo: { baz: 'bak' } });
    });
  });
});
