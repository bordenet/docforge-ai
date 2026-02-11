import { configs } from 'eslint-config-airbnb-extended';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import stylisticPlugin from '@stylistic/eslint-plugin';
import globals from 'globals';

export default [
  // Global ignores - MUST be first
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'shared/js/lib/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },

  // Airbnb Base Config (modern, uses import-x plugin)
  ...configs.base.recommended,

  // Explicitly include plugins needed by airbnb-extended
  {
    plugins: {
      'import-x': importPlugin,
      '@stylistic': stylisticPlugin,
    },
  },

  // Prettier config - disables formatting rules that conflict with Prettier
  eslintConfigPrettier,

  // Project-wide overrides - MUST come after Airbnb to override its rules
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest', // Supports dynamic imports, optional chaining, etc.
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 'latest', // Also set in parserOptions to override Airbnb
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        marked: 'readonly',
        TurndownService: 'readonly',
      },
    },
    rules: {
      // === IMPORT RULES (import-x namespace for modern config) ===
      // Browser ES modules don't use Node resolution
      'import-x/no-unresolved': 'off',
      // Browser ES modules REQUIRE .js extensions - disable Airbnb's "no extensions" rule
      'import-x/extensions': 'off',
      // Allow named exports (this codebase uses them extensively)
      'import-x/prefer-default-export': 'off',
      // Config/test files can use devDependencies
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            'eslint.config.js',
            'jest.config.js',
            'jest.setup.js',
            'playwright.config.js',
            'tests/**/*.js',
            'e2e/**/*.js',
          ],
        },
      ],

      // === CODE STYLE ===
      // Allow console (user-facing tool)
      'no-console': 'off',
      // Unused vars: error with underscore prefix exception
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Allow function expressions
      'func-names': 'off',
      // Allow reassigning function parameter properties
      'no-param-reassign': ['error', { props: false }],
      // Allow function hoisting
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      // Allow for...of loops (remove from Airbnb's restricted syntax)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message:
            'for..in loops iterate over the entire prototype chain, use Object.keys() instead.',
        },
        {
          selector: 'LabeledStatement',
          message: 'Labels are a form of GOTO; using them makes code confusing.',
        },
        {
          selector: 'WithStatement',
          message: '`with` is disallowed in strict mode.',
        },
      ],
      // Allow ++ and -- operators
      'no-plusplus': 'off',
      // Allow continue in loops
      'no-continue': 'off',
      // Allow await in loops (sequential processing)
      'no-await-in-loop': 'off',
      // Allow multi-variable declarations
      'one-var': 'off',
      // Allow nested ternaries (used for concise conditional rendering)
      'no-nested-ternary': 'off',
      // Allow string concatenation (sometimes clearer than templates)
      'prefer-template': 'off',
      // Allow non-destructuring (sometimes clearer)
      'prefer-destructuring': 'off',
      // Allow confirm/alert (user-facing tool)
      'no-alert': 'off',
      'no-restricted-globals': 'off',
      // Allow return assignment in arrow functions
      'no-return-assign': 'off',
      // parseInt without radix is fine for decimal
      radix: 'off',
    },
  },

  // Test file overrides
  {
    files: ['tests/**/*.js', 'e2e/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-underscore-dangle': 'off',
      'max-lines-per-function': 'off',
      'no-magic-numbers': 'off',
      'arrow-body-style': 'off',
      'no-promise-executor-return': 'off',
      'no-return-await': 'off',
      // E2E tests use absolute paths for browser imports
      'import-x/no-absolute-path': 'off',
    },
  },

  // Jest setup file
  {
    files: ['jest.setup.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.jest,
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'no-promise-executor-return': 'off',
    },
  },
];
