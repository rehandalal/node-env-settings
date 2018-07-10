const assert = require('assert');
const proxyquire = require('proxyquire');

import { stubbedEnv } from './fixtures';

const values = proxyquire('../src/values', {
  process: {
    env: stubbedEnv,
  },
});

const { default: Settings } = proxyquire('../src/settings', {
  './values': {
    Value: values.Value,
  },
});

describe('settings.test.js', () => {
  describe('Settings', () => {
    it('works for static values', () => {
      const s = new Settings({
        STATIC_VALUE: 'static',
      });

      assert.deepStrictEqual(s, { STATIC_VALUE: 'static' });
    });

    it('works for default values', () => {
      const s = new Settings({
        DOES_NOT_EXIST: new values.Value('fallback'),
      });

      assert.deepStrictEqual(s, { DOES_NOT_EXIST: 'fallback' });
    });

    it('works for dynamic values with no envName specified', () => {
      const s = new Settings({
        STRING: new values.Value(),
      });

      assert.deepStrictEqual(s, { STRING: 'Test' });
    });

    it('works for dynamic values with Settings.prefix specified', () => {
      const s = new Settings({
        VALUE: new values.Value(),
      }, 'PREFIXED');
      assert.deepStrictEqual(s, { VALUE: 'Prefixed' });
    });

    it('works for dynamic values with envName specified', () => {
      const s = new Settings({
        STRING: new values.Value(null, { envName: 'ONE' }),
      });

      assert.deepStrictEqual(s, { STRING: '1' });
    });

    it('works for dynamic values with envName and Settings.prefix specified', () => {
      const s = new Settings({
        STRING: new values.Value(null, { envName: 'VALUE' }),
      }, 'PREFIXED');

      assert.deepStrictEqual(s, { STRING: 'Prefixed' });
    });

    it('works for dynamic walues with envName, envPrefix and Settings.prefix specified', () => {
      const s = new Settings({
        STRING: new values.Value(null, { envName: 'VALUE', envPrefix: 'PREFIXED' }),
      }, 'FOO');

      assert.deepStrictEqual(s, { STRING: 'Prefixed' });
    });

    it('works for function values that self-reference', () => {
      const s = new Settings({
        STRING: new values.Value(),
        EVALUATED() {
          return `${this.STRING} works!`;
        },
      });

      assert.deepStrictEqual(s, {
        STRING: 'Test',
        EVALUATED: 'Test works!',
      });
    });

    it('works for object values', () => {
      const s = new Settings({
        OBJ: {
          staticValue: 'static',
          dynamicValue: new values.Value(null, { envName: 'STRING' }),
        },
      });

      assert.deepStrictEqual(s, {
        OBJ: {
          staticValue: 'static',
          dynamicValue: 'Test',
        },
      });
    });

    it('caches values after first access', () => {
      let count = 0;

      const s = new Settings({
        COUNT: () => {
          count++;
          return count;
        },
      });

      assert.deepStrictEqual(s, { COUNT: 1 });
      assert.deepStrictEqual(s, { COUNT: 1 });
    });
  });
});
