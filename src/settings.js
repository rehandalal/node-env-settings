import { isPlainObject } from './helpers';
import { Value } from './values';

export default class Settings {
  static prefix = '';

  constructor(settings) {
    this.cache = new Map();
    this.proxy = new Proxy(settings, {
      get: (target, key) => {
        if (this.cache.has(key)) {
          return this.cache.get(key);
        }

        const value = this.parseValue(target[key], key);
        this.cache.set(key, value);
        return value;
      },
    });

    return this.proxy;
  }

  parseValue(value, envName) {
    if (typeof value === 'function') {
      value = value.apply(this.proxy);
    }

    if (value instanceof Value) {
      if (value.options.envName === undefined) {
        value.options.envName = envName;
      }
      if (value.options.envPrefix === undefined) {
        value.options.envPrefix = Settings.prefix;
      }
      value = value.value;
    } else if (isPlainObject(value)) {
      Object.entries(value).forEach(([k, v]) => {
        value[k] = this.parseValue(v);
      });
    }

    return value;
  }
}
