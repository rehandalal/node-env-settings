import { isPlainObject } from './helpers';
import { Value, ValueError } from './values';

export default class Settings {
  static prefix = '';

  constructor(settings) {
    this.cache = {};

    this.proxy = new Proxy(settings, {
      get: (target, key) => {
        const cachedValue = this.cache[key];

        if (cachedValue === undefined) {
          try {
            const value = this._parseValue(target[key], `${this._getPrefix()}${key}`);
            this.cache[key] = value;
            return value;
          } catch (err) {
            if (err instanceof ValueError) {
              throw err;
            } else {
              console.warn(err.message); // eslint-disable-line no-console
            }
          }
        } else {
          return cachedValue;
        }
      },
    });

    return this.proxy;
  }

  _parseValue(obj, envName) {
    let value = obj;

    if (typeof value === 'function') {
      value = value.apply(this.proxy);
    }

    if (value instanceof Value) {
      value.setEmptyOptions({ envName });
      value = value.value();
    } else if (isPlainObject(value)) {
      Object.entries(value).forEach(([k, v]) => {
        value[k] = this._parseValue(v);
      });
    }

    return value;
  }

  _getPrefix() {
    let prefix = Settings.prefix;
    if (prefix && !prefix.endsWith('_')) {
      prefix += '_';
    }
    return prefix;
  }
}
