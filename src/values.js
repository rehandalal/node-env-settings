import * as process from 'process';

import { validateUpperCase } from './helpers';

export class ValueError extends Error {}

export class Value {
  constructor(defaultsTo, options = {}) {
    const _options = { ...options };
    const _privateOptions = {};

    // Set up uppercase validation on some options
    ['envName', 'envPrefix'].forEach(key => {
      Object.defineProperty(_options, key, {
        get: () => {
          return _privateOptions[key];
        },
        set: value => {
          validateUpperCase(value, key);
          _privateOptions[key] = value;
        },
      });
      if (Object.keys(options).includes(key)) {
        _options[key] = options[key];
      }
    });

    Object.defineProperty(this, 'options', {
      get: () => {
        return _options;
      },
    });

    this.defaultsTo = defaultsTo;
  }

  get defaultsTo() {
    return this._defaultsTo;
  }

  set defaultsTo(value) {
    this.validateDefaultsTo(value);
    this._defaultsTo = value;
  }

  get fullEnvName() {
    const { envName } = this.options;
    let { envPrefix = '' } = this.options;

    if (envName === undefined) {
      throw new Error('Unable to resolve envName.');
    }

    if (envPrefix && !envPrefix.endsWith('_')) {
      envPrefix += '_';
    }

    return `${envPrefix}${envName}`;
  }

  get value() {
    if (!this._value) {
      const { envName } = this.options;
      const envValue = process.env[this.fullEnvName];

      if (envValue === undefined) {
        this._value = this.defaultsTo;
      } else {
        try {
          const parsedValue = this.toJS(envValue);
          this._value = parsedValue;
        } catch (err) {
          throw new ValueError(`${envName}: ${err.message}`);
        }
      }
    }
    return this._value;
  }

  toJS(value) {
    // This should be overridden when subclassing.
    return value;
  }

  /* eslint-disable-next-line no-unused-vars */
  validateDefaultsTo(value) {
    // This should be overridden when subclassing.
  }
}

export class BooleanValue extends Value {
  static trueValues = ['true', 'yes', 'y', '1'];
  static falseValues = ['false', 'no', 'n', '0', ''];

  validateDefaultsTo(value) {
    if (![true, false].includes(value)) {
      throw new ValueError('Default value must be a boolean.');
    }
  }

  toJS(value) {
    const normalized = value.toLowerCase();

    if (BooleanValue.trueValues.includes(normalized)) {
      return true;
    } else if (BooleanValue.falseValues.includes(normalized)) {
      return false;
    }

    throw new ValueError('Cannot interpret boolean value.');
  }
}

export class IntegerValue extends Value {
  validateDefaultsTo(value) {
    if (value !== undefined && !Number.isInteger(value)) {
      throw new ValueError('Default value must be an integer.');
    }
  }

  toJS(value) {
    const converted = parseInt(value, 10);
    if (Number.isNaN(converted)) {
      throw new ValueError('Cannot interpret value.');
    }
    return converted;
  }
}

export class PositiveIntegerValue extends IntegerValue {
  validateDefaultsTo(value) {
    super.validateDefaultsTo(value);
    if (value < 0) {
      throw new ValueError('Default value must be >= 0.');
    }
  }

  toJS(value) {
    const intValue = super.toJS(value);
    if (intValue < 0) {
      throw new ValueError('Cannot interpret value.');
    }
    return intValue;
  }
}

export class FloatValue extends Value {
  validateDefaultsTo(value) {
    if (value !== undefined && !(typeof value === 'number' && Number.isFinite(value))) {
      throw new ValueError('Default value must be a finite number.');
    }
  }

  toJS(value) {
    const converted = parseFloat(value);
    if (Number.isNaN(converted)) {
      throw new ValueError('Cannot interpret value.');
    }
    return converted;
  }
}

export class DurationValue extends IntegerValue {
  static SECOND = 1000;
  static MINUTE = 60 * DurationValue.SECOND;
  static HOUR = 60 * DurationValue.MINUTE;
  static DAY = 24 * DurationValue.HOUR;

  toJS(value) {
    let quantity, unit;

    const millisecondsUnits = ['ms', 'millisecond', 'milliseconds'];
    const secondsUnits = ['s', 'sec', 'secs', 'second', 'seconds'];
    const minutesUnits = ['m', 'min', 'mins', 'minute', 'minutes'];
    const hoursUnits = ['h', 'hr', 'hrs', 'hour', 'hours'];
    const daysUnits = ['d', 'day', 'days'];

    const unitsPatterns = [
      ...millisecondsUnits,
      ...secondsUnits,
      ...minutesUnits,
      ...hoursUnits,
      ...daysUnits,
    ].reduce((reduced, current) => `${reduced}|${current}`);

    const re = new RegExp(`^([0-9]*)\\s*((?:${unitsPatterns})?)$`, 'i');

    try {
      [, quantity, unit] = value.match(re);
    } catch (err) {
      throw new ValueError('Cannot interpret value.');
    }

    // Convert quantity to an integer
    quantity = super.toJS(quantity);

    // Normalize unit
    unit = unit.toLowerCase();

    let multiplier = 1;
    if (secondsUnits.includes(unit)) {
      multiplier = DurationValue.SECOND;
    } else if (minutesUnits.includes(unit)) {
      multiplier = DurationValue.MINUTE;
    } else if (hoursUnits.includes(unit)) {
      multiplier = DurationValue.HOUR;
    } else if (daysUnits.includes(unit)) {
      multiplier = DurationValue.DAY;
    }

    return quantity * multiplier;
  }
}
