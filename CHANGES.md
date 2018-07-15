# Changelog

### v0.1.2

- Uses `babel-preset-es2015` during build to improve compatibility.
- Package only includes relevant distribution files.

### v0.1.1

- `Settings` no longer uses a `Proxy`.
- `Settings` is now an immutable object.
- Implemented `Settings.toJS()` and `Settings.merge()`.
- `DurationValue` added to handle durations of time.
