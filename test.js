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
  });
});
