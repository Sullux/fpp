# FPP

_A collection of functional JavaScript utilities for the real world._

To understand the purpose of this repository, please read our full documentation:

* [Why FPP?](https://example.com)
* [FPP Quick Start Guide](https://example.com)
* [Introduction to the FPP Library](https://example.com)
* [Full FPP API](https://example.com)

## Installation and Use

```bash
npm i -S @sullux/fpp
```

```bash
yarn add @sullux/fpp
```

To use FPP as a language feature (e.g. direct access to `pipe` instead of indirect access with `fpp.pipe`) there are two approaches: the global approach and the local approach. Each has its pros and cons, and there is a longer discussion about whether or not it is advisable to "pollute" the global namespace.

I will present both options without wading into a discussion about pros and cons.

### Global Language Feature

To make FPP features available throughout your project, you may want to create a file called `globals.js` as follows:

```javascript
// globals.js
const fpp = require('@sullux/fpp')

const globals = {
  ...fpp
  // add your own globals here
}
Object.assign(globalThis, globals)
module.exports = globals
```

Then at the entry point of your app, just `require('./globals.js')` to ensure that the globals are populated for the rest of your code to use. You may want to do that in your top-level `index.js` file _and_ one of your unit test files so that your unit tests have proper access as well.

If you do it this way, your linter may be unhappy. There are a few ways to calm your linter. One way is with a build step. If you were to add a `build.js` file and add `build: node ./build.js` to your `package.json/scripts` object, you could write your build file like this:

```javascript
// build.js
const { writeFile } = require('fs/promises')
const globalKeys = Object.keys(require('./globals'))

const globals = Object.fromEntries(globalKeys.map((key) => ([key, 'readonly'])))
const config = JSON.stringify({ globals }, null, 2)

writeFile('./.eslintrc', Buffer.from(config))
```

This has been tested with the [Standard](https://www.npmjs.com/package/standard) family of linters and should work with other eslint variants. If you already have an `.eslintrc` file it should be trivial to modify the above code to merge globals into the file rather than overwriting you rexisting settings.

### Local Language Feature

```javascript
const fpp = require('@sullux/fpp')
```
