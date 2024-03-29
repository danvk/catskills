/* eslint-disable no-undef */
/** @type {import("@types/eslint").Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: {
      version: '18',
    },
  },
  env: {
    browser: true,
    es2021: true,
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // Some rule where we'd like to be more strict that typescript-eslint.
    '@typescript-eslint/member-delimiter-style': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/quotes': [
      'error',
      'single',
      {allowTemplateLiterals: true, avoidEscape: true},
    ],
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/no-redeclare': ['error'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': [
      'error',
      {
        hoist: 'all',
      },
    ],
    '@typescript-eslint/ban-ts-comment': ['warn', {minimumDescriptionLength: 10}],
    '@typescript-eslint/parameter-properties': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/no-floating-promises': [
      'error',
      {
        ignoreIIFE: true,
      },
    ],
    '@typescript-eslint/promise-function-async': [
      'error',
      {
        checkArrowFunctions: false,
        checkFunctionDeclarations: true,
        checkFunctionExpressions: true,
        checkMethodDeclarations: true,
      },
    ],

    // Some rules where we'd like to be less strict.
    // It would be nice to turn these on, but there are too many `any` types in @types files.
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // Built-in eslint rules where we'd like to be more strict.
    'arrow-body-style': 'warn',
    'brace-style': ['error', '1tbs'],
    'comma-dangle': ['error', 'always-multiline'],
    curly: 'error',
    eqeqeq: ['error', 'smart'],
    'guard-for-in': 'error',
    'new-parens': 'error',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-eval': 'error',
    'no-multiple-empty-lines': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'one-var': ['error', 'never'],
    'prefer-arrow-callback': ['error', {allowNamedFunctions: true}],
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: false,
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    'quote-props': ['error', 'as-needed'],
    radix: 'error',
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['/'],
      },
    ],
    'no-return-await': 'warn',

    // Additional React rules
    'react/jsx-sort-props': [
      'error',
      {
        callbacksLast: true,
      },
    ],
    'react/jsx-curly-brace-presence': 'error',
    'react/self-closing-comp': 'error',

    // This disallows use of _.noop, which is pretty annoying!
    '@typescript-eslint/unbound-method': 'off',

    // Prefer the typescript-eslint version
    'no-constant-condition': 'off',
    '@typescript-eslint/no-unnecessary-condition': [
      'error',
      {
        // allow while(true)
        allowConstantLoopConditions: true,
      },
    ],
  },
};
