import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: ['dist', 'eslint.config.mjs', 'ecosystem.config.cjs'],
    files: ['**/*.ts', '**/*.tsx'],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
    },

    rules: {
      'prettier/prettier': 'error',
      'newline-before-return': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/prefer-default-export': 'off',
      'max-len': 'off',
      'no-console': 'off',
      'import/no-dynamic-require': 'off',
      'global-require': 'off',
      'no-useless-escape': 'off',
      'class-methods-use-this': 'off',
      'max-classes-per-file': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-param-reassign': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      'spaced-comment': 'error',
      'implicit-arrow-linebreak': 'off',
      'arrow-parens': 'off',
      'nonblock-statement-body-position': 'off',
      curly: 'off',
      'linebreak-style': 'off',
    },
  },
]
