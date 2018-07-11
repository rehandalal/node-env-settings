import { isPlainObject } from './helpers';
import { Value } from './values';

export default class Settings {
  static assign(...args) {
    return new Settings(
      Object.assign(
        ...args.map(arg => {
          if (arg instanceof Settings) {
            const settings = arg._settings;
            Object.entries(settings).forEach(([key, value]) => {
              if (value instanceof Value && value.options.envPrefix === undefined) {
                settings[key].options.envPrefix = arg._prefix;
              }
            });
            return settings;
          }
          return arg;
        })
      )
    );
  }

  constructor(settings = {}, prefix) {
    const cache = new Map();

    // We use defineProperties because we don't want these to be enumerable
    Object.defineProperties(this, {
      _settings: {
        value: { ...settings },
      },
      _prefix: {
        value: prefix,
      },
    });

    const evaluate = (value, envName) => {
      if (typeof value === 'function') {
        value = value.apply(this);
      }

      if (value instanceof Value) {
        if (value.options.envName === undefined) {
          value.options.envName = envName;
        }
        if (value.options.envPrefix === undefined) {
          value.options.envPrefix = this._prefix;
        }
        value = value.value;
      } else if (isPlainObject(value)) {
        Object.entries(value).forEach(([k, v]) => {
          value[k] = evaluate(v);
        });
      }

      return value;
    };

    Object.entries(this._settings).forEach(([key, value]) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        get() {
          if (cache.has(key)) {
            return cache.get(key);
          }

          const evaluatedValue = evaluate(value, key, prefix);
          cache.set(key, evaluatedValue);
          return evaluatedValue;
        },
      });
    });

    // Make this object immutable
    Object.freeze(this);
  }
}
