import update from '../src';
import { expect } from 'chai';

describe('update', () => {
  it('carefully sets deeply nested item: deeply nested array', () => {
    const obj = { foo: { bar: { baz: [1, 2, 3] } }, bak: { big: 1 } };
    const upd = update(obj, 'foo.bar.baz.1', 4);

    expect(upd).to.not.equal(obj);
    expect(upd.foo).to.not.equal(obj.foo);
    expect(upd.foo.bar).to.not.equal(obj.foo.bar);
    expect(upd.bak).to.equal(obj.bak);
    expect(upd.foo.bar.baz).to.eql([1, 4, 3]);
  });

  it('carefully sets deeply nested item: deeply nested object', () => {
    const obj = { foo: { bar: [{ baz: 'baz1' }, { baz: 'baz2' }] }, bak: { big: 1 } };
    const upd = update(obj, 'foo.bar.1.baz', 'baz3');

    expect(upd).to.not.equal(obj);
    expect(upd.foo).to.not.equal(obj.foo);
    expect(upd.foo.bar).to.not.equal(obj.foo.bar);
    expect(upd.foo.bar[0]).to.equal(obj.foo.bar[0]);
    expect(upd.bak).to.equal(obj.bak);
    expect(upd.foo.bar[1]).to.eql({ baz: 'baz3' });
  });

  it('carefully sets deeply nested item, path collections are not defined', () => {
    const obj = { bak: { big: 1 } };
    const upd = update(obj, 'foo.bar.baz.1', 4);

    expect(upd.bak).to.equal(obj.bak);
    expect(Array.isArray(upd.foo.bar.baz)).to.be.true;
    expect(upd.foo.bar.baz[0]).to.be.undefined;
    expect(upd.foo.bar.baz[1]).to.equal(4);
  });

  context('nested object has numeric keys', () => {
    it('uses object keys as paths to update target object', () => {
      const obj = { foo: { '1': { bar: 'baz' } } };
      const upd = update(obj, 'foo.1.bar', 'baz2');

      expect(upd).to.eql({ foo: { '1': { bar: 'baz2' } } });
    });
  });

  context('when object is used as path', () => {
    it('uses object keys as paths to update target object', () => {
      const obj = { foo: { bar: 'baz' }, baz: [{ bak: 'foo' }] };
      const upd = update(obj, { 'foo.bar': 'baz2', 'foo.baz.0.bak': 'foo2' });

      expect(upd.foo.bar).to.equal('baz2');
      expect(upd.foo.baz[0].bak).to.equal('foo2');
    });
  });

  describe('updating multiple keys at once with helpers', () => {
    it('correctly applies `with` helper', () => {
      const obj = { foo: { bar: false, baz: [1, 2] } };
      const upd = update(obj, {
        'foo.bar': true,
        'foo.baz': update.with(baz => baz.map(i => i * 2))
      });

      expect(upd.foo.bar).to.be.true;
      expect(upd.foo.baz).to.eql([2, 4]);
    });

    it('appends new item to the collection', () => {
      const obj = { foo: { bar: false, baz: [1, 2] } };
      const upd = update(obj, {
        'foo.bar': true,
        'foo.baz': update.push(3)
      });

      expect(upd.foo.bar).to.be.true;
      expect(upd.foo.baz).to.eql([1, 2, 3]);
    });

    it('pops item item to the collection', () => {
      const obj = { foo: { bar: false, baz: [1, 2] } };
      const upd = update(obj, {
        'foo.bar': true,
        'foo.baz': update.pop()
      });

      expect(upd.foo.bar).to.be.true;
      expect(upd.foo.baz).to.eql([1]);
    });

    it('correctly assigns with lookup key', () => {
      const obj = { foo: { bar: false, baz: [{ a: 'a1' }, { a: 'a2' }] } };
      const upd = update(obj, {
        'foo.bar': true,
        'foo.baz.{a:a2}': update.assign({ b: 'b2' })
      });

      expect(upd.foo.bar).to.be.true;
      expect(upd.foo.baz).to.eql([{ a: 'a1' }, { a: 'a2', b: 'b2' }]);
    });

    it('correctly removes with lookup keys', () => {
      const obj = { foo: { bar: false, baz: [{ a: 'a1' }, { a: 'a2' }, { a: 'a3' }] } };
      const upd = update(obj, {
        'foo.bar': true,
        'foo.baz.{a:a2}': update.remove()
      });

      expect(upd.foo.bar).to.be.true;
      expect(upd.foo.baz).to.eql([{ a: 'a1' }, { a: 'a3' }]);
    });
  });

  describe('update.with', () => {
    it('sets deeply nested item with setter function', () => {
      const obj = { foo: { bar: { baz: [1, 2, 3] } }, bak: { big: 1 } };
      const upd = update.with(obj, 'foo.bar.baz.1', n => n * 2);

      expect(upd.foo.bar.baz[1]).to.equal(4);
    });
  });

  describe('update.in', () => {
    it('carefully sets deeply nested item, original object changed in place', () => {
      const obj = { foo: { bar: { baz: [1, 2, 3] } }, bak: { big: 1 } };
      const copy = { ...obj };

      update.in(copy, 'foo.bar.baz.1', 4);

      expect(copy.foo).to.not.equal(obj.foo);
      expect(copy.foo.bar).to.not.equal(obj.foo.bar);
      expect(copy.foo.bar.baz).to.not.equal(obj.foo.bar.baz);
      expect(copy.bak).to.equal(obj.bak);
      expect(copy.foo.bar.baz).to.eql([1, 4, 3]);
    });

    describe('update.in.with', () => {
      it('sets deeply nested item with setter function, changing original object in place', () => {
        const obj = { foo: { bar: { baz: [1, 2, 3] } }, bak: { big: 1 } };

        update.in.with(obj, 'foo.bar.baz.1', n => n * 2);
        expect(obj.foo.bar.baz[1]).to.equal(4);
      });
    });
  });

  describe('advanced usage', () => {
    context('when object lookup key is last term in path', () => {
      it('replaces object with new value', () => {
        const obj = { foo: { bar: [{ id: 1, baz: 2 }, { id: 2, baz: 3 }] } };
        const upd = update(obj, 'foo.bar.{id:2}', 5);

        expect(upd.foo.bar[1]).to.equal(5);
        expect(upd.foo.bar).to.not.equal(obj.foo.bar);
      });
    });

    context('when lookup key is multipart', () => {
      it('replaces object with new value', () => {
        const obj = {
          foo: {
            bar: [
              { id: 1, baz: 2, type: 'foo' },
              { id: 2, baz: 3, type: 'foo' },
              { id: 2, baz: 4, type: 'bar' }
            ]
          }
        };
        const upd = update(obj, 'foo.bar.{id:2,type:bar}', 5);

        expect(upd.foo.bar[2]).to.equal(5);
        expect(upd.foo.bar).to.not.equal(obj.foo.bar);
      });
    });

    context('when object lookup key is in the middle of the path', () => {
      it('performs lookup and carefully sets deeply nested item', () => {
        const item1 = { id: 1, baz: 2 };
        const item2 = { id: 2, baz: 3 };
        const obj = { foo: { bar: [item1, item2] } };
        const upd = update(obj, 'foo.bar.{id:2}.baz', 5);

        expect(upd.foo.bar[1].baz).to.equal(5);
        expect(upd.foo.bar[1]).to.not.equal(item2);
        expect(upd.foo.bar[0]).to.equal(item1);
        expect(upd.foo.bar).to.not.equal(obj.foo.bar);
        expect(upd.foo).to.not.equal(obj.foo);
      });
    });

    context('when object lookup container is not array', () => {
      it('throws an exception', () => {
        const obj = { foo: { bar: { baz: 1 } } };

        expect(() => {
          update(obj, 'foo.bar.{baz:1}', 2);
        }).to.throw('object lookup available only for existing collections');
      });
    });

    context('when object lookup container is not defined', () => {
      it('throws an exception', () => {
        const obj = {};

        expect(() => {
          update(obj, 'foo.bar.{id:1}', 2);
        }).to.throw('autocreate with lookup path is not supported');
      });
    });

    context('when object lookup was not found in the collection', () => {
      it('throws an exception', () => {
        const obj = { foo: { bar: [{ id: 1, baz: 2 }] } };

        expect(() => {
          update(obj, 'foo.bar.{id:2}.baz', 3);
        }).to.throw('no object found by {id:2}. autocreate is not supported');
      });
    });

    context('when lookup key or value has `-`', () => {
      it('performs lookup and carefully sets deeply nested item', () => {
        const item1 = { 'item-name': 'item-1', baz: 2 };
        const item2 = { 'item-name': 'item-2', baz: 3 };
        const obj = { foo: { bar: [item1, item2] } };
        const upd = update(obj, 'foo.bar.{item-name:item-2}.baz', 5);

        expect(upd.foo.bar[1].baz).to.equal(5);
        expect(upd.foo.bar[1]).to.not.equal(item2);
        expect(upd.foo.bar[0]).to.equal(item1);
        expect(upd.foo.bar).to.not.equal(obj.foo.bar);
        expect(upd.foo).to.not.equal(obj.foo);
      });
    });

    context('when container has empty elements in it', () => {
      it('correctly operates with lookup key in a array with empty items', () => {
        const obj = { foo: { bar: [{ a: 'a1' }, null, { a: 'a2' }] } };
        const upd = update(obj, 'foo.bar.{a:a2}.a', 'a3');

        expect(upd.foo.bar).to.eql([{ a: 'a1' }, null, { a: 'a3' }]);
      });
    });
  });

  describe('update.unshift', function() {
    it('prepends new item to the collection', function() {
      const obj = { foo: { bar: [1, 2] } };
      const upd = update.unshift(obj, 'foo.bar', 3);

      expect(upd.foo.bar).to.eql([3, 1, 2]);
    });
  });

  describe('update.prepend', function() {
    it('prepends new item to the collection', function() {
      const obj = { foo: { bar: [1, 2] } };
      const upd = update.prepend(obj, 'foo.bar', 3);

      expect(upd.foo.bar).to.eql([3, 1, 2]);
    });
  });

  describe('update.push', function() {
    it('adds new item to the collection', function() {
      const obj = { foo: { bar: [1, 2] } };
      const upd = update.push(obj, 'foo.bar', 3);

      expect(upd.foo.bar).to.eql([1, 2, 3]);
    });
  });

  describe('update.add', function() {
    it('adds new item to the collection', function() {
      const obj = { foo: { bar: [1, 2] } };
      const upd = update.add(obj, 'foo.bar', 3);

      expect(upd.foo.bar).to.eql([1, 2, 3]);
    });
  });

  describe('update.remove', function() {
    it('removes object from the collection', function() {
      const obj = { foo: { bar: [1, 2, 3, 4] } };
      const upd = update.remove(obj, 'foo.bar.1');

      expect(upd.foo.bar).to.eql([1, 3, 4]);
    });

    it('removes object from the collection with lookup path', function() {
      const item1 = { id: 1, baz: 2 };
      const item2 = { id: 2, baz: 3 };
      const obj = { foo: { bar: [item1, item2] } };
      const upd = update.remove(obj, 'foo.bar.{id:2}');

      expect(upd.foo.bar).to.eql([item1]);
      expect(upd.foo.bar[0]).to.equal(item1);
    });
  });

  describe('update.assign', function() {
    it('merges passed object with target one', function() {
      const obj = { foo: { bar: { baz: 'bak' } } };
      const upd = update.assign(obj, 'foo.bar', { bak: 'barbaz' });

      expect(upd.foo.bar).to.eql({ baz: 'bak', bak: 'barbaz' });
    });
  });

  describe('update.del', function() {
    it('removes key from object', function() {
      const obj = { foo: { bar: 'baz', baz: 'bak' } };
      const upd = update.del(obj, 'foo.bar');

      expect(upd).to.eql({ foo: { baz: 'bak' } });
    });
  });
});
