// @ts-expect-error - no published type declarations
import prettier from '@robinblomberg/eslint-config-prettier';
import robinblombergESLintConfig from './index.js';

/**
 * @type {import('eslint').Linter.Config[]}
 */
const config = [...robinblombergESLintConfig, prettier];

export default config;
