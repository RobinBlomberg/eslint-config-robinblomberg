import commentStyle from './comment-style.js';
import paddingLines from './padding-lines.js';
import preferArrowFunctions from './prefer-arrow-functions.js';
import sortDeclarations from './sort-declarations.js';
import sortTests from './sort-tests.js';
import testImportsSource from './test-imports-source.js';

/**
 * The rules that no published plugin has.
 *
 * @type {import('eslint').ESLint.Plugin}
 */
const plugin = {
  meta: {
    name: 'robinblomberg',
  },
  rules: {
    'comment-style': commentStyle,
    'padding-lines': paddingLines,
    'prefer-arrow-functions': preferArrowFunctions,
    'sort-declarations': sortDeclarations,
    'sort-tests': sortTests,
    'test-imports-source': testImportsSource,
  },
};

export default plugin;
