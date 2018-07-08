import * as process from 'process';

export class ValueError extends Error {}

export class Value {
  constructor(defaultsTo, options = {}) {
    this.defaultsTo = defaultsTo;
    this.options = options;
  }

  setEmptyOptions(options) {
    this.options = {
      ...options,
      ...this.options,
    };
  }

  get defaultsTo() {
    return this._defaultsTo;
  }

  set defaultsTo(value) {
    this.validateDefault(value);
    this._defaultsTo = value;
  }

  get value() {
    if (!this._value) {
      const { envName } = this.options;

      if (envName === undefined) {
        throw new ValueError('Unable to resolve envName.');
      } else if (envName !== envName.toUpperCase()) {
        throw new ValueError(`${envName}: envName must be uppercase.`);
      }

      const envValue = process.env[envName];

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

  validateDefault(value) {
    // This should be overridden when subclassing.
    return value;
  }
}

export class BooleanValue extends Value {
  static trueValues = ['true', 'yes', 'y', '1'];
  static falseValues = ['false', 'no', 'n', '0', ''];

  validateDefault(value) {
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
  validateDefault(value) {
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
  validateDefault(value) {
    super.validateDefault(value);
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
  validateDefault(value) {
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
