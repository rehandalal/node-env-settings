const assert = require('assert');

import { isPlainObject } from '../dist/helpers';

describe('isPlainObject()', () => {
  it('is true for {}', () => {
    assert(isPlainObject({}));
  });

  it('is true for Object', () => {
    assert(isPlainObject(new Object()));
  });

  it('is false for []', () => {
    assert(!isPlainObject([]));
  });

  it('is false for Error', () => {
    assert(!isPlainObject(new Error()));
  });

  it('is false for strings', () => {
    assert(!isPlainObject(''));
  });

  it('is false for null', () => {
    assert(!isPlainObject(null));
  });

  it('is false for undefined', () => {
    assert(!isPlainObject(undefined));
  });
});
