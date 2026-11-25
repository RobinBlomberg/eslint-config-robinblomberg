const ABOVE_ONLY_TYPES = new Set(['ReturnStatement', 'ThrowStatement']);

const PADDED_TYPES = new Set([
  'ClassDeclaration',
  'DoWhileStatement',
  'ForInStatement',
  'ForOfStatement',
  'ForStatement',
  'FunctionDeclaration',
  'IfStatement',
  'SwitchStatement',
  'TryStatement',
  'WhileStatement',
]);

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  create: (context) => {
    const { sourceCode } = context;

    /**
     * Checks that a blank line separates each pair of statements that needs one,
     * and that one is above each comment on its own line between statements.
     *
     * @param {any[]} statements
     */
    const checkStatements = (statements) => {
      for (const [index, statement] of statements.entries()) {
        const previous = statements[index - 1];

        // Imports and re-exports stay in one block, even with comments between:
        if (
          !previous ||
          (isImportOrReExport(previous) && isImportOrReExport(statement))
        ) {
          continue;
        }

        // A comment after the previous statement on its last line belongs to it:
        const trailingComment = sourceCode
          .getCommentsAfter(previous)
          .findLast((comment) => {
            return comment.loc?.start.line === previous.loc.end.line;
          });

        /** @type {any} */
        const previousEnd = trailingComment ?? sourceCode.getLastToken(previous);

        /** @type {any} */
        const next = sourceCode.getTokenAfter(previousEnd, {
          includeComments: true,
        });

        const isComment = next.type === 'Block' || next.type === 'Line';
        const lineGap = next.loc.start.line - previousEnd.loc.end.line;

        if (lineGap >= 2) {
          continue;
        }

        if (isComment || needsBlankLine(previous, statement)) {
          context.report({
            fix: (fixer) => {
              return fixer.insertTextAfter(
                previousEnd,
                '\n'.repeat(2 - lineGap),
              );
            },
            loc: next.loc,
            messageId: 'missingBlankLine',
          });
        }
      }
    };

    return {
      'BlockStatement, Program, StaticBlock, TSModuleBlock': (
        /** @type {any} */ node,
      ) => {
        checkStatements(node.body);
      },
      SwitchCase: (/** @type {any} */ node) => {
        checkStatements(node.consequent);
      },
    };
  },
  meta: {
    docs: {
      description:
        'Require blank lines around multiline statements, control statements and functions, and above `return`, `throw` and comments between statements.',
    },
    fixable: 'whitespace',
    messages: {
      missingBlankLine: 'Add a blank line above this line.',
    },
    schema: [],
    type: 'layout',
  },
};

/**
 * Returns the declaration that a statement exports, or the statement itself.
 *
 * @param {any} statement
 * @return {any}
 */
const getDeclaration = (statement) => {
  return statement.type === 'ExportDefaultDeclaration' ||
    (statement.type === 'ExportNamedDeclaration' && statement.declaration)
    ? statement.declaration
    : statement;
};

/**
 * Returns whether an expression is a function, ignoring type assertions around it.
 *
 * @param {any} node
 * @return {boolean}
 */
const isFunction = (node) => {
  let expression = node;

  while (
    expression?.type === 'TSAsExpression' ||
    expression?.type === 'TSNonNullExpression' ||
    expression?.type === 'TSSatisfiesExpression'
  ) {
    expression = expression.expression;
  }

  return (
    expression?.type === 'ArrowFunctionExpression' ||
    expression?.type === 'FunctionExpression'
  );
};

/**
 * Returns whether a statement imports or re-exports, which stays in a block of
 * imports or exports without blank lines, even when it spans multiple lines.
 *
 * @param {any} statement
 * @return {boolean}
 */
const isImportOrReExport = (statement) => {
  return (
    statement.type === 'ExportAllDeclaration' ||
    statement.type === 'ImportDeclaration' ||
    statement.type === 'TSImportEqualsDeclaration' ||
    (statement.type === 'ExportNamedDeclaration' && Boolean(statement.source))
  );
};

/**
 * Returns whether a statement is an overload signature of the function after it,
 * which stays next to it.
 *
 * @param {any} previous
 * @param {any} statement
 * @return {boolean}
 */
const isOverloadOf = (previous, statement) => {
  const previousDeclaration = getDeclaration(previous);
  const declaration = getDeclaration(statement);

  return (
    previousDeclaration.type === 'TSDeclareFunction' &&
    (declaration.type === 'FunctionDeclaration' ||
      declaration.type === 'TSDeclareFunction') &&
    previousDeclaration.id?.name === declaration.id?.name
  );
};

/**
 * Returns whether a statement needs a blank line both above and below it.
 *
 * @param {any} statement
 * @return {boolean}
 */
const isPadded = (statement) => {
  const declaration = getDeclaration(statement);

  if (isImportOrReExport(statement)) {
    return false;
  }

  return (
    statement.loc.start.line !== statement.loc.end.line ||
    PADDED_TYPES.has(declaration.type) ||
    (declaration.type === 'VariableDeclaration' &&
      declaration.declarations.some((/** @type {any} */ declarator) => {
        return isFunction(declarator.init);
      }))
  );
};

/**
 * Returns whether two consecutive statements need a blank line between them.
 *
 * @param {any} previous
 * @param {any} statement
 * @return {boolean}
 */
const needsBlankLine = (previous, statement) => {
  return (
    !isOverloadOf(previous, statement) &&
    (isPadded(previous) ||
      isPadded(statement) ||
      ABOVE_ONLY_TYPES.has(statement.type))
  );
};

export default rule;
