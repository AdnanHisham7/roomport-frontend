import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser:        tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // TypeScript-specific
      '@typescript-eslint/no-explicit-any':               'warn',
      '@typescript-eslint/no-unused-vars':                ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports':       ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises':          'error',
      '@typescript-eslint/await-thenable':                'error',
      '@typescript-eslint/no-misused-promises':           'error',

      // General
      'no-console':            ['error', { allow: [] }],
      'no-debugger':            'error',
      'prefer-const':           'error',
      'no-var':                 'error',
      'eqeqeq':                ['error', 'always'],
      'object-shorthand':       'error',
    },
  },
  {
    // Relax rules for test/seed files if added later
    files: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
