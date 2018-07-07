const assert = require('assert');
const proxyquire = require('proxyquire');

const stubEnv = {
  STRING: 'Test',
  INT: '2',
  NEGATIVE_INT: '-1',
  FLOAT: '3.27',
  YES: 'yes',
  Y: 'Y',
  ONE: '1',
  TRUE: 'True',
  NO: 'No',
  N: 'n',
  ZERO: '0',
  FALSE: 'FALSE',
};

const values = proxyquire('../dist/values', {
  process: {
    env: stubEnv,
  }
});

describe('Value', () => {
  describe('constructor', () => {
    it('works', () => {
      const v = new values.Value('test', { envName: 'TEST' });
      assert.deepStrictEqual(v.options, { envName: 'TEST' });
      assert.deepStrictEqual(v.defaultsTo, 'test');
    });
  });

  describe('.setEmptyOptions()', () => {
    const v = new values.Value(undefined);

    it('sets options that are empty', () => {
      v.setEmptyOptions({ envName: 'ONE' });
      assert.deepStrictEqual(v.options, { envName: 'ONE' });
    });

    it('does not set options that are not empty', () => {
      v.setEmptyOptions({ envName: 'TWO' });
      assert.deepStrictEqual(v.options, { envName: 'ONE' });
    });
  });

  describe('.value()', () => {
    function newValue(envName, defaultsTo) {
      const v = new values.Value(defaultsTo, { envName });
      return v;
    }

    it('gets the value from the environment', () => {
      const v = newValue('STRING');
      assert.deepStrictEqual(v.value(), 'Test');
    });

    it('errors on empty envName', () => {
      const v = newValue();
      assert.throws(
        v.value.bind(v),
        values.ValueError,
        'Unable to resolve envName.',
      );
    });

    it('errors on non-uppercase envName', () => {
      const v = newValue('test');
      assert.throws(
        v.value.bind(v),
        values.ValueError,
        'test: envName must be uppercase.',
      );
    });

    it('returns the default when not in the environment', () => {
      const v = newValue('DOES_NOT_EXIST', 'fallback');
      assert.deepStrictEqual(v.value(), 'fallback');
    });
  });
});
