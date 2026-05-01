import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import { globalIgnores } from 'eslint/config';

export default [
  {
    name: 'shared/js-vue',
    files: [ '**/*.{js,mjs,cjs,vue}' ],
  },

  globalIgnores([ '**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/_old/**' ]),

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        log: true,
      },
      ecmaVersion: 'latest',
    },
    rules: {
      semi: [ 'warn', 'always' ],
      'no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
        },
      ],
      'no-debugger': 'off',
      indent: [ 'warn', 2, { SwitchCase: 1 } ],
      quotes: [ 'warn', 'single' ],
      'comma-dangle': [ 'warn', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      } ],
      'array-bracket-spacing': [ 'warn', 'always' ],
      'object-curly-spacing': [ 'warn', 'always' ],
      'template-curly-spacing': [ 'warn', 'always' ],
      'arrow-parens': [ 'warn', 'as-needed' ],
      'brace-style': [ 'warn', 'stroustrup', { 'allowSingleLine': true } ],
      'no-console': [ 'warn', { allow: [ 'info', 'warn', 'error' ] } ],
      'no-trailing-spaces': [ 'warn' ],
      'eol-last': [ 'warn' ],

      // Vue rules
      'vue/html-indent': [ 'warn', 2, {
        'alignAttributesVertically': false,
        'baseIndent': 0,
      } ],
      'vue/max-attributes-per-line': [ 'warn', {
        'singleline': { 'max': 2 },
        'multiline': { 'max': 1 },
      } ],
      'vue/html-closing-bracket-newline': [ 'warn', {
        'singleline': 'never',
        'multiline': 'always',
      } ],
      'vue/mustache-interpolation-spacing': [ 'warn', 'always' ],
      'vue/no-multi-spaces': 'warn',
      'vue/first-attribute-linebreak': 'warn',
    },
  },
];
