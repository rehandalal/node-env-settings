export function isPlainObject(obj) {
  // Basic check for Type object that's not null
  if (typeof obj === 'object' && obj !== null) {

    // If Object.getPrototypeOf supported, use it
    if (typeof Object.getPrototypeOf === 'function') {
      var proto = Object.getPrototypeOf(obj);
      return proto === Object.prototype || proto === null;
    }

    // Otherwise, use internal class
    // This should be reliable if getPrototypeOf not supported
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  // Not an object
  return false;
}
