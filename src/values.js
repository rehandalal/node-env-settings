import * as process from 'process';

export class ValueError extends Error {}

/**
 * A mixin for simple type casting of values.
 *
 * @param {class} superclass  The class to be extended.
 * @returns {class}  The extended class.
 */
export const CastingMixin = superclass => class extends superclass {
  convert(value) {
    // This should be overridden when subclassing.
    return value;
  }

  toJS(value) {
    try {
      return this.convert(value);
    } catch (err) {
      throw new ValueError('Cannot interpret value.');
    }
  }
};

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

export class IntegerValue extends CastingMixin(Value) {
  validateDefault(value) {
    if (value !== undefined && !Number.isInteger(value)) {
      throw new ValueError('Default value must be an integer.');
    }
  }

  convert(value) {
    return parseInt(value, 10);
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

export class FloatValue extends CastingMixin(Value) {
  convert(value) {
    return parseFloat(value);
  }
}
