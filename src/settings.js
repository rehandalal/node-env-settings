import { isPlainObject } from './helpers';
import { Value } from './values';

export default class Settings {
  constructor(settings = {}, prefix) {
    const cache = new Map();

    const parseValue = (value, envName, envPrefix) => {
      if (typeof value === 'function') {
        value = value.apply(this);
      }

      if (value instanceof Value) {
        if (value.options.envName === undefined) {
          value.options.envName = envName;
        }
        if (value.options.envPrefix === undefined) {
          value.options.envPrefix = envPrefix;
        }
        value = value.value;
      } else if (isPlainObject(value)) {
        Object.entries(value).forEach(([k, v]) => {
          value[k] = parseValue(v);
        });
      }

      return value;
    };

    Object.entries(settings).forEach(([key, value]) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        get() {
          if (cache.has(key)) {
            return cache.get(key);
          }

          const parsedValue = parseValue(value, key, prefix);
          cache.set(key, parsedValue);
          return parsedValue;
        },
      });
    });

    Object.freeze(this);
  }
}
