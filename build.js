const { writeFile } = require('fs/promises')
const globalKeys = Object.keys(require('./globals'))

const globals = Object.fromEntries(globalKeys.map((key) => ([key, 'readonly'])))

const eslintConfig = {
  globals,
  rules: {
    'comma-dangle': [
      'error',
      'always-multiline',
    ],
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    es6: true,
  },
}

const config = JSON.stringify(eslintConfig, null, 2)

writeFile('./.eslintrc', Buffer.from(config))
