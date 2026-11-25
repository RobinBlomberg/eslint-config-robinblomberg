// A relative module that isn't a test, e.g. `./add.js` but not `./add.test.js`:
const SOURCE_REGEXP = /^\.\.?\/(?!.*\.(?:spec|test)(?:\.[cm]?[jt]sx?)?$)/;

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  create: (context) => {
    let hasSourceImport = false;

    const checkSource = (/** @type {any} */ source) => {
      if (
        typeof source?.value === 'string' &&
        SOURCE_REGEXP.test(source.value)
      ) {
        hasSourceImport = true;
      }
    };

    return {
      ExportAllDeclaration: (/** @type {any} */ node) => {
        checkSource(node.source);
      },
      ImportDeclaration: (/** @type {any} */ node) => {
        checkSource(node.source);
      },
      ImportExpression: (/** @type {any} */ node) => {
        checkSource(node.source);
      },
      'Program:exit': (/** @type {any} */ node) => {
        if (!hasSourceImport) {
          context.report({
            loc: { column: 0, line: 1 },
            messageId: 'missingSourceImport',
            node,
          });
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'Require test files to import the code that they test, rather than only test or duplicate behavior on their own.',
    },
    messages: {
      missingSourceImport:
        'Import and test the real code, e.g. `./add.js`, instead of testing or duplicating behavior without it.',
    },
    schema: [],
    type: 'problem',
  },
};

export default rule;
