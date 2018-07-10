import { isPlainObject } from './helpers';
import { Value } from './values';

function parseValue(composedSettings, value, envName, envPrefix) {
  if (typeof value === 'function') {
    value = value.apply(composedSettings);
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
      value[k] = parseValue(composedSettings, v);
    });
  }

  return value;
}

export default class Settings {
  constructor(settings, prefix) {
    const composed = {};
    const cache = new Map();

    Object.entries(settings).forEach(([settingKey, settingValue]) => {
      Object.defineProperty(composed, settingKey, {
        enumerable: true,
        get() {
          if (cache.has(settingKey)) {
            return cache.get(settingKey);
          }

          const value = parseValue(composed, settingValue, settingKey, prefix);
          cache.set(settingKey, value);
          return value;
        },
      });
    });

    return composed;
  }
}
