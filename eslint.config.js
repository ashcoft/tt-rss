import globals from 'globals';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import vue from 'eslint-plugin-vue';

export default [
  js.configs.recommended,

  // Vue files - use flat config
  ...(vue.configs['flat/recommended'] || []),

  {
    files: ['js/**/*.js', 'plugins/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        // Dojo
        dojo: 'readonly',
        dijit: 'readonly'
      }
    },

    plugins: {
      '@stylistic/js': stylistic
    },

    rules: {
      'no-console': 'off',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'no-empty': ['error', { 'allowEmptyCatch': true }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-extend-native': 'error',
      'array-callback-return': 'error',
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable-loop': 'error',
      'no-constructor-return': 'error',
      'no-new-wrappers': 'error',
      'no-var': 'error',
      'prefer-spread': 'error',
      'prefer-object-spread': 'error',
      'no-useless-rename': 'error',
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      '@stylistic/js/eol-last': 'error',
      '@stylistic/js/no-trailing-spaces': 'error',
      '@stylistic/js/no-multiple-empty-lines': ['error', { 'max': 2 }],
      '@stylistic/js/keyword-spacing': ['error', { 'after': true, 'before': true }],
      '@stylistic/js/block-spacing': ['error', 'always'],
      '@stylistic/js/computed-property-spacing': ['error', 'never'],
      '@stylistic/js/max-statements-per-line': ['warn', { 'max': 2 }]
    }
  },

  // Vite migration: browser-based shim files with relaxed rules
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        console: 'readonly',
        // Dojo globals
        dojo: 'readonly',
        dijit: 'readonly',
        // AMD Shim globals
        AMDShim: 'readonly',
        __amdShim: 'readonly'
      }
    },

    plugins: {
      '@stylistic/js': stylistic
    },

    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'no-empty': ['error', { 'allowEmptyCatch': true }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-extend-native': 'error',
      'array-callback-return': 'error',
      'no-var': 'error',
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      '@stylistic/js/eol-last': 'error',
      '@stylistic/js/no-trailing-spaces': 'error',
      '@stylistic/js/no-multiple-empty-lines': ['error', { 'max': 2 }]
    }
  },

  // Vue files
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser,
        console: 'readonly'
      }
    },
    plugins: {
      vue: vue
    },
    rules: {
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/multi-word-component-names': 'off'
    }
  },

  // Vite config: Node.js based
  {
    files: ['vite.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },

    rules: {
      'no-undef': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off'
    }
  },

  // TypeScript files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        console: 'readonly'
      }
    },
    rules: {
      'no-undef': 'off',
      'no-console': 'off'
    }
  }
];
