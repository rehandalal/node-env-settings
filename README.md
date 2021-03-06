# node-env-settings

[![Travis](https://img.shields.io/travis/rehandalal/node-env-settings.svg)](https://travis-ci.org/rehandalal/node-env-settings)
[![Coveralls github](https://img.shields.io/coveralls/github/rehandalal/node-env-settings.svg)](https://coveralls.io/github/rehandalal/node-env-settings)
[![npm](https://img.shields.io/npm/v/node-env-settings.svg)](https://www.npmjs.com/package/node-env-settings)

node-env-settings is a utility library to make reading Node.js application settings
from environment variables easier.

It was heavily inspired by 
[django-configurations](https://github.com/jazzband/django-configurations).

### Quickstart

Install node-env-settings:

```
npm install node-env-settings
```

Create a new `Settings` object to read settings from the environment variables:

```js
// settings.js

import { Settings, values } from 'node-env-settings';

export default new Settings({
  DEBUG: values.BooleanValue(false),
  MY_SETTING: values.Value('default value'),
}, 'REACT_APP');
```

This will attempt to read `REACT_APP_DEBUG` and `REACT_APP_MY_SETTING` from your
environment variables.
