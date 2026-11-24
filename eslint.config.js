import eslintConfigPrettier from '@robinblomberg/eslint-config-prettier';
import eslintConfigRobinBlomberg from './src/index.js';

/**
 * @type {import('eslint').Linter.Config[]}
 */
const config = [
  { ignores: ['dist/'] },
  ...eslintConfigRobinBlomberg,
  ...eslintConfigPrettier,
];

export default config;
