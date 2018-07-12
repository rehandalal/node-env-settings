import { isPlainObject } from './helpers';
import { Value } from './values';

/** A class representing a number of static or dynamic settings. */
export default class Settings {
  /**
   * Returns a new Settings object with the other settings merged in from right to left.
   *
   * @param {...(Object|Settings)}
   * @returns {Settings}
   */
  static merge(...args) {
    return new Settings(
      Object.assign(
        ...args.map(arg => {
          if (arg instanceof Settings) {
            return Settings.toJS(arg);
          }
          return arg;
        })
      )
    );
  }

  /**
   * Converts a Settings object into a plain javascript object without evaluating the values.
   *
   * It will assign the Settings object's prefix to all the first-descendant Value objects that
   * do not already have a prefix assigned.
   *
   * @param {Settings} obj The Settings object to be converted.
   * @returns {Object}
   */
  static toJS(obj) {
    const settings = obj._settings;
    Object.entries(settings).forEach(([key, value]) => {
      if (value instanceof Value && value.options.envPrefix === undefined) {
        settings[key].options.envPrefix = obj._prefix;
      }
    });
    return settings;
  }

  /**
   * Create an immutable Settings object.
   *
   * @param {Object} [settings={}]
   * @param {String} [prefix] The default prefix to use for first-descendant Value objects
   */
  constructor(settings = {}, prefix) {
    const cache = new Map();

    // We use defineProperties because we don't want these to be enumerable
    Object.defineProperties(this, {
      _settings: {
        value: { ...settings },
        enumerable: false,
      },
      _prefix: {
        value: prefix,
        enumerable: false,
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

          const evaluatedValue = evaluate(value, key);
          cache.set(key, evaluatedValue);
          return evaluatedValue;
        },
      });
    });

    // Make this object immutable
    Object.freeze(this);
  }
}
