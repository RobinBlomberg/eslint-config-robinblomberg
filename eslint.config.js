import eslintConfigPrettier from '@robinblomberg/eslint-config-prettier';
import eslintConfigRobinBlomberg from './index.js';

/**
 * @type {import('eslint').Linter.Config[]}
 */
const config = [...eslintConfigRobinBlomberg, ...eslintConfigPrettier];

export default config;
