import {
  getDeclaration,
  GROUPS,
  isLoadTimeReference,
} from './module-declarations.js';

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  create: (context) => {
    const { filename, sourceCode } = context;
    /** @type {Map<any[], Set<string>>} */
    const hoistedFunctionNamesByStatements = new Map();

    /**
     * Returns the names of the functions in the statements of a block or module
     * that need hoisting, computed once per block.
     *
     * @param {any[]} statements
     * @return {Set<string>}
     */
    const getHoistedNames = (statements) => {
      const names =
        hoistedFunctionNamesByStatements.get(statements) ??
        getHoistedFunctionNames(sourceCode, statements);
      hoistedFunctionNamesByStatements.set(statements, names);

      return names;
    };

    /**
     * Returns why a function can't be an arrow function, if it can't.
     *
     * @param {any} node
     * @return {boolean}
     */
    const needsFunctionKeyword = (node) => {
      const { generator, parent } = node;

      return (
        generator ||
        parent.type === 'ExportDefaultDeclaration' ||
        parent.type === 'MethodDefinition' ||
        (parent.type === 'Property' &&
          (parent.method || parent.kind !== 'init')) ||
        usesOwnThisOrArguments(sourceCode, node)
      );
    };

    return {
      FunctionDeclaration: (/** @type {any} */ node) => {
        const statement =
          node.parent.type === 'ExportNamedDeclaration' ? node.parent : node;
        // A block's or the module's statements, or a `case` clause's:
        const statements =
          statement.parent.body ?? statement.parent.consequent ?? [];
        const isHoisted = getHoistedNames(statements).has(node.id?.name);

        if (
          !node.id ||
          needsFunctionKeyword(node) ||
          hasOverloads(node) ||
          isHoisted
        ) {
          return;
        }

        context.report({
          fix: (fixer) => {
            const isTSX = filename.endsWith('.tsx');
            const typeParameters = node.typeParameters
              ? sourceCode.getText(node.typeParameters)
              : '';
            const parametersStart = (node.typeParameters ?? node.id).range[1];
            const parametersEnd = (node.returnType ?? node.body).range[0];
            const parameters = sourceCode.text
              .slice(parametersStart, parametersEnd)
              .trim();
            const returnType = node.returnType
              ? sourceCode.getText(node.returnType)
              : '';
            // In TSX, `<T>` would start a JSX element:
            const arrowTypeParameters =
              isTSX && node.typeParameters?.params.length === 1
                ? typeParameters.replace(/>$/, ',>')
                : typeParameters;

            return fixer.replaceTextRange(
              [node.range[0], node.range[1]],
              `const ${node.id.name} = ${node.async ? 'async ' : ''}${arrowTypeParameters}${parameters}${returnType} => ${sourceCode.getText(node.body)};`,
            );
          },
          messageId: 'preferArrowFunction',
          node: node.id,
        });
      },
      FunctionExpression: (/** @type {any} */ node) => {
        if (needsFunctionKeyword(node)) {
          return;
        }

        context.report({
          messageId: 'preferArrowFunction',
          node,
        });
      },
    };
  },
  meta: {
    docs: {
      description:
        'Use arrow functions, unless a function needs `this`, `arguments`, a generator, overloads, or hoisting because it runs while the module loads.',
    },
    fixable: 'code',
    messages: {
      preferArrowFunction:
        'Use an arrow function. Function declarations and expressions are only for `this`, `arguments`, generators, overloads, or hoisting when a declaration uses the function while the module loads.',
    },
    schema: [],
    type: 'suggestion',
  },
};

/**
 * Returns the names of the functions in a block or module that run before their
 * declaration while the block runs or the module loads, directly or through other
 * functions, and therefore need a hoisted function declaration.
 *
 * @param {import('eslint').SourceCode} sourceCode
 * @param {any[]} statements
 * @return {Set<string>}
 */
const getHoistedFunctionNames = (sourceCode, statements) => {
  const functions = statements.flatMap((statement) => {
    const declaration = getDeclaration(statement);
    return declaration?.group === GROUPS.function ? [declaration] : [];
  });
  /** @type {Map<string, number>} */
  const firstCalls = new Map();
  /** @type {string[]} */
  const queue = [];

  const addCall = (/** @type {string} */ name, /** @type {number} */ index) => {
    const declarationIndex = statements.findIndex((statement) => {
      return getDeclaration(statement)?.name === name;
    });
    const previousIndex = firstCalls.get(name);

    if (
      index < declarationIndex &&
      (previousIndex === undefined || index < previousIndex)
    ) {
      firstCalls.set(name, index);
      queue.push(name);
    }
  };

  const getStatementIndex = (/** @type {any} */ node) => {
    return statements.findIndex((statement) => {
      return (
        node.range[0] >= statement.range[0] &&
        node.range[1] <= statement.range[1]
      );
    });
  };

  for (const declaration of functions) {
    const variable = getVariable(sourceCode, declaration);

    for (const reference of variable?.references ?? []) {
      const identifier = /** @type {any} */ (reference.identifier);
      const index = getStatementIndex(identifier);
      const statement = statements[index];

      if (statement && isLoadTimeReference(sourceCode, identifier, statement)) {
        addCall(declaration.name, index);
      }
    }
  }

  // A function that runs while the module loads also runs what it uses:
  while (queue.length > 0) {
    const name = queue.shift() ?? '';
    const index = firstCalls.get(name) ?? 0;
    const caller = functions.find((declaration) => {
      return declaration.name === name;
    });

    for (const declaration of functions) {
      const variable = getVariable(sourceCode, declaration);
      const isUsedByCaller = (variable?.references ?? []).some((reference) => {
        const identifier = /** @type {any} */ (reference.identifier);

        return (
          caller &&
          identifier.range[0] >= caller.statement.range[0] &&
          identifier.range[1] <= caller.statement.range[1]
        );
      });

      if (isUsedByCaller) {
        addCall(declaration.name, index);
      }
    }
  }

  return new Set(firstCalls.keys());
};

/**
 * Returns the variable that a declaration declares, in any scope.
 *
 * @param {import('eslint').SourceCode} sourceCode
 * @param {import('./module-declarations.js').Declaration} declaration
 * @return {import('eslint').Scope.Variable | undefined}
 */
const getVariable = (sourceCode, declaration) => {
  return sourceCode.getDeclaredVariables(declaration.node).find((variable) => {
    return variable.name === declaration.name;
  });
};

/**
 * Returns whether a function declaration has overload signatures, which only
 * function declarations can have.
 *
 * @param {any} node
 * @return {boolean}
 */
const hasOverloads = (node) => {
  const statements =
    node.parent.type === 'ExportNamedDeclaration'
      ? node.parent.parent.body
      : (node.parent.body ?? []);

  return statements.some((/** @type {any} */ statement) => {
    const declaration =
      statement.type === 'ExportNamedDeclaration'
        ? statement.declaration
        : statement;

    return (
      declaration?.type === 'TSDeclareFunction' &&
      declaration.id?.name === node.id?.name
    );
  });
};

/**
 * Returns whether a function uses its own `this` or `arguments`, which arrow
 * functions don't have.
 *
 * @param {import('eslint').SourceCode} sourceCode
 * @param {any} functionNode
 * @return {boolean}
 */
const usesOwnThisOrArguments = (sourceCode, functionNode) => {
  /** @type {any[]} */
  const stack = [functionNode.body];

  while (stack.length > 0) {
    const node = stack.pop();

    if (node.type === 'ThisExpression') {
      return true;
    }

    if (node.type === 'Identifier' && node.name === 'arguments') {
      return true;
    }

    // These have a `this` and `arguments` of their own:
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ClassBody'
    ) {
      continue;
    }

    for (const key of sourceCode.visitorKeys[node.type] ?? []) {
      const child = node[key];

      for (const childNode of Array.isArray(child) ? child : [child]) {
        if (childNode && typeof childNode.type === 'string') {
          stack.push(childNode);
        }
      }
    }
  }

  return false;
};

export default rule;
