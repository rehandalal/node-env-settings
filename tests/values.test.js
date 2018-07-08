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
  },
});

describe('values.test.js', () => {
  describe('Value', () => {
    it('works', () => {
      const v = new values.Value('test', {envName: 'TEST'});
      assert.deepStrictEqual(v.options, {envName: 'TEST'});
      assert.deepStrictEqual(v.defaultsTo, 'test');
    });

    describe('.setEmptyOptions()', () => {
      const v = new values.Value(undefined);

      it('sets options that are empty', () => {
        v.setEmptyOptions({envName: 'ONE'});
        assert.deepStrictEqual(v.options, {envName: 'ONE'});
      });

      it('does not set options that are not empty', () => {
        v.setEmptyOptions({envName: 'TWO'});
        assert.deepStrictEqual(v.options, {envName: 'ONE'});
      });
    });

    describe('.value', () => {
      function newValue(envName, defaultsTo) {
        const v = new values.Value(defaultsTo, {envName});
        return v;
      }

      it('gets the value from the environment', () => {
        const v = newValue('STRING');
        assert.deepStrictEqual(v.value, 'Test');
      });

      it('errors on empty envName', () => {
        const v = newValue();
        assert.throws(
          () => v.value,
          values.ValueError,
          'Unable to resolve envName.',
        );
      });

      it('errors on non-uppercase envName', () => {
        const v = newValue('test');
        assert.throws(
          () => v.value,
          values.ValueError,
          'test: envName must be uppercase.',
        );
      });

      it('returns the default when not in the environment', () => {
        const v = newValue('DOES_NOT_EXIST', 'fallback');
        assert.deepStrictEqual(v.value, 'fallback');
      });

      it('caches the value after first accessed', () => {
        const v = newValue('DOES_NOT_EXIST', 'fallback');
        assert.deepStrictEqual(v.value, 'fallback');

        stubEnv.DOES_NOT_EXIST = 'exists now!';
        assert.deepStrictEqual(v.value, 'fallback');
        delete stubEnv.DOES_NOT_EXIST; // Clean up
      });
    });
  });

  describe('BooleanValue', () => {
    it('works', () => {
      new values.BooleanValue(true);
    });

    it('errors on invalid default value', () => {
      assert.throws(
        () => new values.BooleanValue('false'),
        values.ValueError,
        'Default value must be a boolean.',
      );
    });

    describe('.value', () => {
      function newValue(envName, defaultsTo) {
        const v = new values.BooleanValue(defaultsTo, {envName});
        return v;
      }

      it('works for true values', () => {
        let v = newValue('YES', false);
        assert.deepStrictEqual(v.value, true);

        v = newValue('Y', false);
        assert.deepStrictEqual(v.value, true);

        v = newValue('ONE', false);
        assert.deepStrictEqual(v.value, true);

        v = newValue('TRUE', false);
        assert.deepStrictEqual(v.value, true);
      });

      it('works for false values', () => {
        let v = newValue('NO', true);
        assert.deepStrictEqual(v.value, false);

        v = newValue('N', true);
        assert.deepStrictEqual(v.value, false);

        v = newValue('ZERO', true);
        assert.deepStrictEqual(v.value, false);

        v = newValue('FALSE', true);
        assert.deepStrictEqual(v.value, false);
      });

      it('errors on invalid values', () => {
        const v = newValue('STRING', false);
        assert.throws(
          () => v.value,
          values.ValueError,
          'Cannot interpret boolean value',
        );
      });

      it('returns the default correctly', () => {
        const v = newValue('DOES_NOT_EXIST', true);
        assert.deepStrictEqual(v.value, true);
      });
    });
  });

  describe('IntegerValue', () => {
    it('works', () => {
      new values.IntegerValue();
    });
  });
});