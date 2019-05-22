import update from '../src/fp';
import updatePlain from '../src';
import { expect } from 'chai';

describe('updateFp', () => {
  it('updates object accoding to path', () => {
    const obj = { foo: { bar: [{ baz: 'baz1' }, { baz: 'baz2' }] }, bak: { big: 1 } };
    const upd = update('foo.bar.1.baz', 'baz3')(obj);

    expect(upd).to.not.equal(obj);
    expect(upd.foo.bar[0]).to.equal(obj.foo.bar[0]);
    expect(upd.bak).to.equal(obj.bak);
    expect(upd.foo.bar[1]).to.eql({ baz: 'baz3' });
  });

  describe('updating multiple keys at once with special helpers', () => {
    it('correctly applies `with` helper', () => {
      const obj = { foo: { bar: false, baz: [1, 2] } };
      const upd = update({
        'foo.bar': true,
        'foo.baz': updatePlain.with(baz => baz.map(i => i * 2))
      })(obj);

      expect(upd.foo.bar).to.be.true;
      expect(upd.foo.baz).to.eql([2, 4]);
    });
  });

  describe('update.with', () => {
    it('sets deeply nested item with setter function', () => {
      const obj = { foo: { bar: { baz: [1, 2, 3] } }, bak: { big: 1 } };
      const upd = update.with('foo.bar.baz.1', n => n * 2)(obj);

      expect(upd.foo.bar.baz[1]).to.equal(4);
    });
  });

  describe('update.unshift', () => {
    it('prepends new item to the collection', () => {
      const obj = { foo: { bar: [1, 2] } };
      const upd = update.unshift('foo.bar', 3)(obj);

      expect(upd.foo.bar).to.eql([3, 1, 2]);
    });
  });

  describe('update.prepend', () => {
    it('prepends new item to the collection', () => {
      const obj = { foo: { bar: [1, 2] } };
      const upd = update.prepend('foo.bar', 3)(obj);

      expect(upd.foo.bar).to.eql([3, 1, 2]);
    });
  });

  describe('update.push', () => {
    it('adds new item to the collection', () => {
      const obj = { foo: { bar: [1, 2] } };
      const upd = update.push('foo.bar', 3)(obj);

      expect(upd.foo.bar).to.eql([1, 2, 3]);
    });
  });

  describe('update.add', () => {
    it('adds new item to the collection', () => {
      const obj = { foo: { bar: [1, 2] } };
      const upd = update.add('foo.bar', 3)(obj);

      expect(upd.foo.bar).to.eql([1, 2, 3]);
    });
  });

  describe('update.remove', () => {
    it('removes object from the collection', () => {
      const obj = { foo: { bar: [1, 2, 3, 4] } };
      const upd = update.remove('foo.bar.1')(obj);

      expect(upd.foo.bar).to.eql([1, 3, 4]);
    });

    it('removes object from the collection with lookup path', () => {
      const item1 = { id: 1, baz: 2 };
      const item2 = { id: 2, baz: 3 };
      const obj = { foo: { bar: [item1, item2] } };
      const upd = update.remove('foo.bar.{id:2}')(obj);

      expect(upd.foo.bar).to.eql([item1]);
      expect(upd.foo.bar[0]).to.equal(item1);
    });
  });

  describe('update.assign', () => {
    it('merges passed object with target one', () => {
      const obj = { foo: { bar: { baz: 'bak' } } };
      const upd = update.assign('foo.bar', { bak: 'barbaz' })(obj);

      expect(upd.foo.bar).to.eql({ baz: 'bak', bak: 'barbaz' });
    });
  });

  describe('update.del', () => {
    it('removes key from object', () => {
      const obj = { foo: { bar: 'baz', baz: 'bak' } };
      const upd = update.del('foo.bar')(obj);

      expect(upd).to.eql({ foo: { baz: 'bak' } });
    });
  });
});
