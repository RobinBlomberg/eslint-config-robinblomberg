import commentStyle from './comment-style.js';
import preferArrowFunctions from './prefer-arrow-functions.js';
import sortDeclarations from './sort-declarations.js';
import sortTests from './sort-tests.js';

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
    'prefer-arrow-functions': preferArrowFunctions,
    'sort-declarations': sortDeclarations,
    'sort-tests': sortTests,
  },
};

export default plugin;
