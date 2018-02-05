const WARN = 1;
const ERROR = 2;
const DISABLE = 0;

module.exports = {
  extends: ['eslint:recommended', 'airbnb-base'],

  env: {
    es6: true,
    node: true,
    browser: true,
  },

  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },

  rules: {
    'no-case-declarations': ERROR,
    'no-console': ERROR,
    'no-constant-condition': ERROR,
    'no-empty-function': ERROR,
    'no-func-assign': ERROR,
    'no-self-compare': ERROR,
    'no-throw-literal': ERROR,
    'no-unused-vars': ERROR,
    'no-useless-call': ERROR,
    'no-useless-constructor': ERROR,
    'no-useless-return': ERROR,
    'no-var': ERROR,
    'no-undef': ERROR,
    'no-underscore-dangle': DISABLE,

    // This patterns is very convenient in reduce:
    //   result[k] = v, result
    'no-sequences': DISABLE,
    'no-return-assign': DISABLE,
    'no-param-reassign': DISABLE,

    'arrow-parens': [ERROR, 'as-needed'],
    'comma-dangle': [
      ERROR,
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      },
    ],
  },
};
