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

function assertSettingsEqual(settingsObject, expected) {
  assert(settingsObject instanceof Settings);
  assert.deepStrictEqual({ ...settingsObject }, expected);
}

describe('settings.test.js', () => {
  describe('Settings', () => {
    it('is an instance of Settings', () => {
      const s = new Settings();
      assert(s instanceof Settings);
    });

    it('is immutable', () => {
      const s = new Settings();
      assert.throws(
        () => s.NEW_SETTING = 'foo',
        Error,
      );
    });

    it('works for static values', () => {
      const s = new Settings({
        STATIC_VALUE: 'static',
      });

      assertSettingsEqual(s, { STATIC_VALUE: 'static' });
    });

    it('works for default values', () => {
      const s = new Settings({
        DOES_NOT_EXIST: new values.Value('fallback'),
      });

      assertSettingsEqual(s, { DOES_NOT_EXIST: 'fallback' });
    });

    it('works for dynamic values with no envName specified', () => {
      const s = new Settings({
        STRING: new values.Value(),
      });

      assertSettingsEqual(s, { STRING: 'Test' });
    });

    it('works for dynamic values with Settings.prefix specified', () => {
      const s = new Settings({
        VALUE: new values.Value(),
      }, 'PREFIXED');
      assertSettingsEqual(s, { VALUE: 'Prefixed' });
    });

    it('works for dynamic values with envName specified', () => {
      const s = new Settings({
        STRING: new values.Value(null, { envName: 'ONE' }),
      });

      assertSettingsEqual(s, { STRING: '1' });
    });

    it('works for dynamic values with envName and Settings.prefix specified', () => {
      const s = new Settings({
        STRING: new values.Value(null, { envName: 'VALUE' }),
      }, 'PREFIXED');

      assertSettingsEqual(s, { STRING: 'Prefixed' });
    });

    it('works for dynamic walues with envName, envPrefix and Settings.prefix specified', () => {
      const s = new Settings({
        STRING: new values.Value(null, { envName: 'VALUE', envPrefix: 'PREFIXED' }),
      }, 'FOO');

      assertSettingsEqual(s, { STRING: 'Prefixed' });
    });

    it('works for function values that self-reference', () => {
      const s = new Settings({
        STRING: new values.Value(),
        EVALUATED() {
          return `${this.STRING} works!`;
        },
      });

      assertSettingsEqual(s, {
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

      assertSettingsEqual(s, {
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

      assert.deepStrictEqual(s.COUNT, 1);
      assert.deepStrictEqual(s.COUNT, 1);
    });

    describe('.assign', () => {
      it('correctly assigns new settings', () => {
        const s1 = new Settings({
          EVALUATED() {
            return this.STRING;
          },
          STRING: new values.Value(),
        });

        const s2 = new Settings({
          STRING: new values.Value('', { envName: 'PREFIXED_VALUE' }),
          FOO: new values.Value('BAR'),
        });

        const result = Settings.assign(s1, s2);

        assertSettingsEqual(result, {
          STRING: 'Prefixed',
          EVALUATED: 'Prefixed',
          FOO: 'BAR',
        });
      });

      it('work for plain objects', () => {
        const s = new Settings({
          LOREM: 'ipsum',
          STRING: new values.Value(),
        });

        const result = Settings.assign(s, {
          STRING: 'foo',
          FOO: 'bar',
        });

        assertSettingsEqual(result, {
          LOREM: 'ipsum',
          STRING: 'foo',
          FOO: 'bar',
        });
      });

      it('retains prefixes correctly', () => {
        const s = new Settings({
          VALUE: new values.Value(),
        }, 'PREFIXED');

        const result = Settings.assign({}, s);

        assertSettingsEqual(result, {
          VALUE: 'Prefixed',
        });
      });
    });
  });
});
