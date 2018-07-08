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
