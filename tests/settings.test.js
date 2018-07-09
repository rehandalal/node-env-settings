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

    it('works for dynamic values with no envName specified', () => {
      const s = new Settings({
        STRING: new values.Value(),
      });

      assert.deepStrictEqual(s, { STRING: 'Test' });
    });

    it('works for dynamic values with Settings.prefix specified', () => {
      Settings.prefix = 'PREFIXED';
      const s = new Settings({
        VALUE: new values.Value(),
      });
      assert.deepStrictEqual(s, { VALUE: 'Prefixed' });
      Settings.prefix = '';
    });
  });
});
