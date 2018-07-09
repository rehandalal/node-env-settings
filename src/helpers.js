/**
 * A basic helper function to determine if an object is an instance of Object
 * and not an instance of a subclass of Object.
 *
 * @param {any} obj
 * @returns {boolean}
 */
export function isPlainObject(obj) {
  /* istanbul ignore next */
  if (typeof obj === 'object' && obj !== null) {
    // If Object.getPrototypeOf supported, use it
    if (typeof Object.getPrototypeOf === 'function') {
      var proto = Object.getPrototypeOf(obj);
      return proto === Object.prototype || proto === null;
    }

    // Otherwise, use the internal class name
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  return false;
}

/**
 * Validates that the passed string is all uppercase.
 *
 * @param str  The string to be validated
 * @param name  Name of the variable that the string is being assigned to.
 */
export function validateUpperCase(str, name) {
  if (typeof str === 'string' && str !== str.toUpperCase()) {
    throw new Error(`${name} must be uppercase.`);
  }
}
