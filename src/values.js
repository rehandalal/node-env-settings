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
}


export class Value {
  constructor(defaultsTo, options = {}) {
    this.defaultsTo = defaultsTo;
    this.options = options;
  }

  setEmptyOptions(options) {
    this.options = {
      ...options,
      ...this.options,
    }
  }

  value() {
    const { envName } = this.options;

    if (envName === undefined) {
      throw new ValueError('Unable to resolve envName.')
    } else if (envName !== envName.toUpperCase()) {
      throw new ValueError(`${envName}: envName must be uppercase.`)
    }

    const envValue = process.env[envName];
    const value = envValue === undefined ? this.defaultsTo : envValue;

    try {
      return this.toJS(value);
    } catch (err) {
      throw new ValueError(`${envName}: ${err.message}`);
    }
  }

  toJS(value) {
    // This should be overridden when subclassing.
    return value;
  }
}

export class BooleanValue extends Value {
  static trueValues = ['true', 'yes', 'y', '1'];
  static falseValues = ['false', 'no', 'n', '0', ''];

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
  convert(value) {
    return parseInt(value, 10);
  }
}

export class PositiveIntegerValue extends IntegerValue {
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
