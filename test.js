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
});
