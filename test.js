var update = require('./');
var assert = require('assert');

describe('update', function() {
  it('carefully sets deeply nested item: deeply nested array', function() {
    var obj = { foo: { bar: { baz: [1, 2, 3] } }, bak: { big: 1 } };
    var upd = update(obj, 'foo.bar.baz.1', 4);

    assert.notStrictEqual(upd, obj, 'obj should not be updated in place');
    assert.notStrictEqual(upd.foo, obj.foo, 'obj.foo should not be updated in place');
    assert.notStrictEqual(upd.foo.bar, obj.foo.bar, 'obj.foo.bar should not be updated in place');
    assert.notStrictEqual(upd.foo.bar.baz, obj.foo.bar.baz, 'obj.foo.bar.baz should not be updated in place');
    assert.strictEqual(upd.bak, obj.bak, 'obj.bak should not be cloned');
    assert.deepEqual(upd.foo.bar.baz, [1, 4, 3], 'value under desired name should be updated');
  });

  it('carefully sets deeply nested item: deeply nested object', function() {
    var obj = { foo: { bar: [{ baz: 'baz1' }, { baz: 'baz2' }] }, bak: { big: 1 } };
    var upd = update(obj, 'foo.bar.1.baz', 'baz3');

    assert.notStrictEqual(upd, obj, 'obj should not be updated in place');
    assert.notStrictEqual(upd.foo, obj.foo, 'obj.foo should not be updated in place');
    assert.notStrictEqual(upd.foo.bar, obj.foo.bar, 'obj.foo.bar should not be updated in place');
    assert.strictEqual(upd.foo.bar[0], obj.foo.bar[0], 'obj.foo.bar items should not be cloned');
    assert.strictEqual(upd.bak, obj.bak, 'obj.bak should not be cloned');
    assert.deepEqual(upd.foo.bar[1], { baz: 'baz3' }, 'value under desired name should be updated');
  });

  it('carefully sets deeply nested item, path collections are not defined', function() {
    var obj = { bak: { big: 1 } };
    var upd = update(obj, 'foo.bar.baz.1', 4);

    assert.strictEqual(upd.bak, obj.bak, 'obj.bak should not be cloned');
    assert.ok(Array.isArray(upd.foo.bar.baz));
    assert.equal(upd.foo.bar.baz[0], undefined)
    assert.equal(upd.foo.bar.baz[1], 4, 'value under desired name should be updated');
  });

  context('nested object has numeric keys', function() {
    it('uses object keys as paths to update target object', function() {
      var obj = { foo: { '1': { bar: 'baz' } } };
      var upd = update(obj, 'foo.1.bar', 'baz2');

      assert.deepEqual(upd, { foo: { '1': { bar: 'baz2' } } });
    });
  });

  context('when object is used as path', function() {
    it('uses object keys as paths to update target object', function() {
      var obj = { foo: { bar: 'baz' }, baz: [{ bak: 'foo' }] };
      var upd = update(obj, { 'foo.bar': 'baz2', 'foo.baz.0.bak': 'foo2' });

      assert.equal(upd.foo.bar, 'baz2');
      assert.equal(upd.foo.baz[0].bak, 'foo2');
    });
  });

  describe('updating multiple keys at once with helpers', function() {
    it('correctly applies `with` helper', function() {
      var obj = { foo: { bar: false, baz: [1, 2] } };
      var upd = update(obj, {
        'foo.bar': true,
        'foo.baz': update.with(baz => baz.map(i => i * 2))
      });

      assert.equal(upd.foo.bar, true);
      assert.deepEqual(upd.foo.baz, [2, 4]);
    });

    it('appends new item to the collection', function() {
      var obj = { foo: { bar: false, baz: [1, 2] } };
      var upd = update(obj, {
        'foo.bar': true,
        'foo.baz': update.push(3)
      });

      assert.equal(upd.foo.bar, true);
      assert.deepEqual(upd.foo.baz, [1, 2, 3]);
    });

    it('pops item item to the collection', function() {
      var obj = { foo: { bar: false, baz: [1, 2] } };
      var upd = update(obj, {
        'foo.bar': true,
        'foo.baz': update.pop()
      });

      assert.equal(upd.foo.bar, true);
      assert.deepEqual(upd.foo.baz, [1]);
    });

    it('correctly assigns with lookup key', function() {
      var obj = { foo: { bar: false, baz: [{ a: 'a1' }, { a: 'a2' }] } };
      var upd = update(obj, {
        'foo.bar': true,
        'foo.baz.{a:a2}': update.assign({ b: 'b2' })
      });

      assert.equal(upd.foo.bar, true);
      assert.deepEqual(upd.foo.baz, [{ a: 'a1' }, { a: 'a2', b: 'b2' }]);
    });

    it('correctly removes with lookup keys', function() {
      var obj = { foo: { bar: false, baz: [{ a: 'a1' }, { a: 'a2' }, { a: 'a3' }] } };
      var upd = update(obj, {
        'foo.bar': true,
        'foo.baz.{a:a2}': update.remove()
      });

      assert.equal(upd.foo.bar, true);
      assert.deepEqual(upd.foo.baz, [{ a: 'a1' }, { a: 'a3' }]);
    });
  });

  describe('update.with', function() {
    it('sets deeply nested item with setter function', function() {
      var obj = { foo: { bar: { baz: [1, 2, 3] } }, bak: { big: 1 } };
      var upd = update.with(obj, 'foo.bar.baz.1', function(n){ return n * 2 });

      assert.equal(upd.foo.bar.baz[1], 4);
    });
  });

  describe('update.in', function() {
    it('carefully sets deeply nested item, original object changed in place', function() {
      var obj = { foo: { bar: { baz: [1, 2, 3] } }, bak: { big: 1 } };
      var copy = Object.assign({}, obj);

      update.in(copy, 'foo.bar.baz.1', 4);
      assert.notStrictEqual(copy.foo, obj.foo, 'obj.foo should not be updated in place');
      assert.notStrictEqual(copy.foo.bar, obj.foo.bar, 'obj.foo.bar should not be updated in place');
      assert.notStrictEqual(copy.foo.bar.baz, obj.foo.bar.baz, 'obj.foo.bar.baz should not be updated in place');
      assert.strictEqual(copy.bak, obj.bak, 'obj.bak should not be cloned');
      assert.deepEqual(copy.foo.bar.baz, [1, 4, 3], 'value under desired name should be updated');
    });

    describe('update.in.with', function() {
      it('sets deeply nested item with setter function, changing original object in place', function() {
        var obj = { foo: { bar: { baz: [1, 2, 3] } }, bak: { big: 1 } };

        update.in.with(obj, 'foo.bar.baz.1', function(n){ return n * 2 });
        assert.equal(obj.foo.bar.baz[1], 4);
      });
    });
  });

  describe('advanced usage', function() {
    context('when object lookup is last term in path', function() {
      it('replaces object with new value', function() {
        var obj = { foo: { bar: [{ id: 1, baz: 2 }, { id: 2, baz: 3 }] } };
        var upd = update(obj, 'foo.bar.{id:2}', 5);

        assert.equal(upd.foo.bar[1], 5);
        assert.notStrictEqual(upd.foo.bar, obj.foo.bar, 'obj.foo.bar should not be updated in place');
      });
    });

    context('when object lookup is in the middle of the path', function() {
      it('performs lookup and carefully sets deeply nested item', function() {
        var item1 = { id: 1, baz: 2 };
        var item2 = { id: 2, baz: 3 };
        var obj = { foo: { bar: [item1, item2] } };
        var upd = update(obj, 'foo.bar.{id:2}.baz', 5);

        assert.equal(upd.foo.bar[1].baz, 5);
        assert.notStrictEqual(upd.foo.bar[1], item2, 'updated item should not be updated in place');
        assert.strictEqual(upd.foo.bar[0], item1, 'items in the collection should not be cloned');
        assert.notStrictEqual(upd.foo.bar, obj.foo.bar, 'collection should not be updated in place');
        assert.notStrictEqual(upd.foo, obj.foo, 'object should not be updated in place');
      });
    });

    context('when object lookup container is not array', function() {
      it('throws an exception', function(){
        var obj = { foo: { bar: { baz: 1 } } };
        assert.throws(function() {
          update(obj, 'foo.bar.{baz:1}', 2);
        }, 'object lookup available only for existing collections');
      });
    });

    context('when object lookup container is not defined', function() {
      it('throws an exception', function(){
        var obj = {};
        assert.throws(function() {
          update(obj, 'foo.bar.{id:1}', 2);
        }, 'autocreate with lookup path is not supported');
      });
    });

    context('when object lookup was not found in the collection', function() {
      it('throws an exception', function(){
        var obj = { foo: { bar: [{ id: 1, baz: 2 }] } };
        assert.throws(function() {
          update(obj, 'foo.bar.{id:2}.baz', 3);
        }, 'no object found by {id:2}. autocreate is not supported');
      });
    });

    context('when lookup key or value has `-`', function() {
      it('performs lookup and carefully sets deeply nested item', function() {
        var item1 = { 'item-name': 'item-1', baz: 2 };
        var item2 = { 'item-name': 'item-2', baz: 3 };
        var obj = { foo: { bar: [item1, item2] } };
        var upd = update(obj, 'foo.bar.{item-name:item-2}.baz', 5);

        assert.equal(upd.foo.bar[1].baz, 5);
        assert.notStrictEqual(upd.foo.bar[1], item2, 'updated item should not be updated in place');
        assert.strictEqual(upd.foo.bar[0], item1, 'items in the collection should not be cloned');
        assert.notStrictEqual(upd.foo.bar, obj.foo.bar, 'collection should not be updated in place');
        assert.notStrictEqual(upd.foo, obj.foo, 'object should not be updated in place');
      });
    });
  });

  describe('update.unshift', function() {
    it('prepends new item to the collection', function() {
      var obj = { foo: { bar: [1, 2] } };
      var upd = update.unshift(obj, 'foo.bar', 3);

      assert.deepEqual(upd.foo.bar, [3, 1, 2]);
    });
  });

  describe('update.prepend', function() {
    it('prepends new item to the collection', function() {
      var obj = { foo: { bar: [1, 2] } };
      var upd = update.prepend(obj, 'foo.bar', 3);

      assert.deepEqual(upd.foo.bar, [3, 1, 2]);
    });
  });

  describe('update.push', function() {
    it('adds new item to the collection', function() {
      var obj = { foo: { bar: [1, 2] } };
      var upd = update.push(obj, 'foo.bar', 3);

      assert.deepEqual(upd.foo.bar, [1, 2, 3]);
    });
  });

  describe('update.add', function() {
    it('adds new item to the collection', function() {
      var obj = { foo: { bar: [1, 2] } };
      var upd = update.add(obj, 'foo.bar', 3);

      assert.deepEqual(upd.foo.bar, [1, 2, 3]);
    });
  });

  describe('update.remove', function() {
    it('removes object from the collection', function() {
      var obj = { foo: { bar: [1, 2, 3, 4] } };
      var upd = update.remove(obj, 'foo.bar.1');

      assert.deepEqual(upd.foo.bar, [1, 3, 4]);
    });

    it('removes object from the collection with lookup path', function() {
      var item1 = { id: 1, baz: 2 };
      var item2 = { id: 2, baz: 3 };
      var obj = { foo: { bar: [item1, item2] } };
      var upd = update.remove(obj, 'foo.bar.{id:2}');

      assert.deepEqual(upd.foo.bar, [item1]);
      assert.strictEqual(upd.foo.bar[0], item1);
    });
  });

  describe('update.assign', function() {
    it('merges passed object with target one', function() {
      var obj = { foo: { bar: { baz: 'bak' } } };
      var upd = update.assign(obj, 'foo.bar', { bak: 'barbaz' });

      assert.deepEqual(upd.foo.bar, { baz: 'bak', bak: 'barbaz' });
    });
  });

  describe('update.del', function() {
    it('removes key from object', function() {
      var obj = { foo: { bar: 'baz', baz: 'bak' } };
      var upd = update.del(obj, 'foo.bar');

      assert.deepEqual(upd, { foo: { baz: 'bak' } });
    });
  });
});
