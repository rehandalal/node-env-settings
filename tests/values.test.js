const assert = require('assert');
const proxyquire = require('proxyquire');

import { stubbedEnv } from './fixtures';

const values = proxyquire('../src/values', {
  process: {
    env: stubbedEnv,
  },
});

describe('values.test.js', () => {
  describe('Value', () => {
    it('works', () => {
      new values.Value();
    });

    it('errors on non-uppercase envName', () => {
      assert.throws(
        () => new values.Value(null, { envName: 'envName' }),
        Error,
        'envName must be uppercase.',
      );

      const v = new values.Value();
      assert.throws(
        () => v.options.envName = 'envName',
        Error,
        'envName must be uppercase.',
      );
    });

    it('errors on non-uppercase envPrefix', () => {
      assert.throws(
        () => new values.Value(null, { envPrefix: 'envPrefix' }),
        Error,
        'envPrefix must be uppercase.',
      );

      const v = new values.Value();
      assert.throws(
        () => v.options.envPrefix = 'envPrefix',
        Error,
        'envPrefix must be uppercase.',
      );
    });

    describe('.fullEnvName', () => {
      it('errors on empty envName', () => {
        const v = new values.Value();
        assert.throws(
          () => v.fullEnvName,
          Error,
          'Unable to resolve envName.',
        );
      });

      it('works with only an envName', () => {
        const v = new values.Value(null, { envName: 'ENVNAME' });
        assert.equal(v.fullEnvName, 'ENVNAME');
      });

      it('works with both an envName and envPrefix', () => {
        let v = new values.Value(null, { envName: 'ENVNAME', envPrefix: 'PREFIX' });
        assert.equal(v.fullEnvName, 'PREFIX_ENVNAME');

        v = new values.Value(null, { envName: 'ENVNAME', envPrefix: 'PREFIX_' });
        assert.equal(v.fullEnvName, 'PREFIX_ENVNAME');
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

      it('returns the default when not in the environment', () => {
        const v = newValue('DOES_NOT_EXIST', 'fallback');
        assert.deepStrictEqual(v.value, 'fallback');
      });

      it('caches the value after first accessed', () => {
        const v = newValue('DOES_NOT_EXIST', 'fallback');
        assert.deepStrictEqual(v.value, 'fallback');

        stubbedEnv.DOES_NOT_EXIST = 'exists now!';
        assert.deepStrictEqual(v.value, 'fallback');
        delete stubbedEnv.DOES_NOT_EXIST; // Clean up
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
          'Cannot interpret boolean value.',
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
      new values.IntegerValue(2);
      new values.IntegerValue(-5);
    });

    it('errors on invalid default value', () => {
      assert.throws(
        () => new values.IntegerValue('1'),
        values.ValueError,
        'Default value must be an integer.',
      );

      assert.throws(
        () => new values.IntegerValue(1.5),
        values.ValueError,
        'Default value must be an integer.',
      );
    });

    describe('.value', () => {
      function newValue(envName, defaultsTo) {
        const v = new values.IntegerValue(defaultsTo, {envName});
        return v;
      }

      it('works for numeric strings', () => {
        let v = newValue('INT');
        assert.deepStrictEqual(v.value, 23);

        v = newValue('FLOAT');
        assert.deepStrictEqual(v.value, 32);
      });

      it('errors on non-numeric strings', () => {
        const v = newValue('STRING');
        assert.throws(
          () => v.value,
          values.ValueError,
          'Cannot interpret value.'
        );
      });

      it('returns the default correctly', () => {
        const v = newValue('DOES_NOT_EXIST', 12);
        assert.deepStrictEqual(v.value, 12);
      });
    });
  });

  describe('PositiveIntegerValue', () => {
    it('works', () => {
      new values.PositiveIntegerValue();
      new values.PositiveIntegerValue(2);
    });

    it('errors on invalid default value', () => {
      assert.throws(
        () => new values.PositiveIntegerValue(-10),
        values.ValueError,
        'Default value must be a positive integer.',
      );
    });

    describe('.value', () => {
      function newValue(envName, defaultsTo) {
        const v = new values.PositiveIntegerValue(defaultsTo, {envName});
        return v;
      }

      it('works for positive numeric strings', () => {
        let v = newValue('INT');
        assert.deepStrictEqual(v.value, 23);

        v = newValue('FLOAT');
        assert.deepStrictEqual(v.value, 32);
      });

      it('errors on negative numeric strings', () => {
        const v = newValue('NEGATIVE_INT');
        assert.throws(
          () => v.value,
          values.ValueError,
          'Cannot interpret value.'
        );
      });

      it('returns the default correctly', () => {
        const v = newValue('DOES_NOT_EXIST', 12);
        assert.deepStrictEqual(v.value, 12);
      });
    });
  });

  describe('FloatValue', () => {
    it('works', () => {
      new values.FloatValue();
      new values.FloatValue(1);
      new values.FloatValue(1.5);
    });

    it('errors on invalid default value', () => {
      assert.throws(
        () => new values.FloatValue(1/0),
        values.ValueError,
        'Default value must be a finite number.',
      );

      assert.throws(
        () => new values.FloatValue(NaN),
        values.ValueError,
        'Default value must be a finite number.',
      );

      assert.throws(
        () => new values.FloatValue('1'),
        values.ValueError,
        'Default value must be a finite number.',
      );
    });

    describe('.value', () => {
      function newValue(envName, defaultsTo) {
        const v = new values.FloatValue(defaultsTo, {envName});
        return v;
      }

      it('works for numeric strings', () => {
        let v = newValue('INT');
        assert.deepStrictEqual(v.value, 23);

        v = newValue('FLOAT');
        assert.deepStrictEqual(v.value, 32.33);
      });

      it('errors on non-numeric strings', () => {
        const v = newValue('STRING');
        assert.throws(
          () => v.value,
          values.ValueError,
          'Cannot interpret value.'
        );
      });

      it('returns the default correctly', () => {
        const v = newValue('DOES_NOT_EXIST', 12.2);
        assert.deepStrictEqual(v.value, 12.2);
      });
    });
  });

  describe('DurationValue', () => {
    it('works', () => {
      new values.DurationValue();
    });

    describe('.value', () => {
      function newValue(envName, defaultsTo) {
        const v = new values.DurationValue(defaultsTo, {envName});
        return v;
      }

      it('returns the default correctly', () => {
        const v = newValue('DOES_NOT_EXIST', 2 * values.DurationValue.MINUTE);
        assert.deepStrictEqual(v.value, 120000);
      });

      it('returns the value if there is no unit', () => {
        const v = newValue('INT');
        assert.deepStrictEqual(v.value, 23);
      });

      it('returns the value if set in milliseconds', () => {
        stubbedEnv.DV_MILLISECONDS = '2ms';
        let v = newValue('DV_MILLISECONDS');
        assert.deepStrictEqual(v.value, 2);

        stubbedEnv.DV_MILLISECONDS = '1 millisecond';
        v = newValue('DV_MILLISECONDS');
        assert.deepStrictEqual(v.value, 1);

        stubbedEnv.DV_MILLISECONDS = '3 milliseconds';
        v = newValue('DV_MILLISECONDS');
        assert.deepStrictEqual(v.value, 3);

        delete stubbedEnv.DV_MILLISECONDS;
      });

      it('returns the value if set in seconds', () => {
        stubbedEnv.DV_SECONDS = '2s';
        let v = newValue('DV_SECONDS');
        assert.deepStrictEqual(v.value, 2000);

        stubbedEnv.DV_SECONDS = '1 sec';
        v = newValue('DV_SECONDS');
        assert.deepStrictEqual(v.value, 1000);

        stubbedEnv.DV_SECONDS = '2 secs';
        v = newValue('DV_SECONDS');
        assert.deepStrictEqual(v.value, 2000);

        stubbedEnv.DV_SECONDS = '1 second';
        v = newValue('DV_SECONDS');
        assert.deepStrictEqual(v.value, 1000);

        stubbedEnv.DV_SECONDS = '2 seconds';
        v = newValue('DV_SECONDS');
        assert.deepStrictEqual(v.value, 2000);

        delete stubbedEnv.DV_SECONDS;
      });

      it('returns the value if set in minutes', () => {
        stubbedEnv.DV_MINUTES = '2m';
        let v = newValue('DV_MINUTES');
        assert.deepStrictEqual(v.value, 120000);

        stubbedEnv.DV_MINUTES = '1 min';
        v = newValue('DV_MINUTES');
        assert.deepStrictEqual(v.value, 60000);

        stubbedEnv.DV_MINUTES = '2 mins';
        v = newValue('DV_MINUTES');
        assert.deepStrictEqual(v.value, 120000);

        stubbedEnv.DV_MINUTES = '1 minute';
        v = newValue('DV_MINUTES');
        assert.deepStrictEqual(v.value, 60000);

        stubbedEnv.DV_MINUTES = '2 minutes';
        v = newValue('DV_MINUTES');
        assert.deepStrictEqual(v.value, 120000);

        delete stubbedEnv.DV_MINUTES;
      });

      it('returns the value if set in hours', () => {
        stubbedEnv.DV_HOURS = '2h';
        let v = newValue('DV_HOURS');
        assert.deepStrictEqual(v.value, 7200000);

        stubbedEnv.DV_HOURS = '1 hr';
        v = newValue('DV_HOURS');
        assert.deepStrictEqual(v.value, 3600000);

        stubbedEnv.DV_HOURS = '2 hrs';
        v = newValue('DV_HOURS');
        assert.deepStrictEqual(v.value, 7200000);

        stubbedEnv.DV_HOURS = '1 hour';
        v = newValue('DV_HOURS');
        assert.deepStrictEqual(v.value, 3600000);

        stubbedEnv.DV_HOURS = '2 hours';
        v = newValue('DV_HOURS');
        assert.deepStrictEqual(v.value, 7200000);

        delete stubbedEnv.DV_HOURS;
      });

      it('returns the value if set in days', () => {
        stubbedEnv.DV_DAYS = '2d';
        let v = newValue('DV_DAYS');
        assert.deepStrictEqual(v.value, 172800000);

        stubbedEnv.DV_DAYS = '1 day';
        v = newValue('DV_DAYS');
        assert.deepStrictEqual(v.value, 86400000);

        stubbedEnv.DV_DAYS = '2 days';
        v = newValue('DV_DAYS');
        assert.deepStrictEqual(v.value, 172800000);

        delete stubbedEnv.DV_DAYS;
      });

      it('errors on badly formatted value', () => {
        stubbedEnv.DURATION = '20x';
        const v = newValue('DURATION');
        assert.throws(
          () => v.value,
          values.ValueError,
          'Cannot interpret value.',
        );
        delete stubbedEnv.DURATION;
      });
    });
  });
});
