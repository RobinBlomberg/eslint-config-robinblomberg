const FUNCTION_TYPES = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
]);

export const GROUP_NAMES = [
  '',
  'type',
  'constant',
  'variable',
  'function',
  'class',
];

/**
 * @typedef {{
 *   group: number;
 *   name: string;
 *   node: any;
 *   statement: any;
 * }} Declaration
 */

/**
 * The order of the top-level declaration groups.
 */
export const GROUPS = {
  class: 5,
  constant: 2,
  function: 4,
  type: 1,
  variable: 3,
};

/**
 * Compares names case-insensitively in the `en-US` locale, like the
 * `perfectionist` rules with the shared settings of this config.
 *
 * @param {string} first
 * @param {string} second
 * @return {number}
 */
export const compareNames = (first, second) => {
  return first.toLowerCase().localeCompare(second.toLowerCase(), 'en-US');
};

/**
 * Returns the declaration that a top-level statement makes, or `undefined` for
 * other statements, e.g. imports, re-exports and expressions.
 *
 * @param {any} statement
 * @return {Declaration | undefined}
 */
export const getDeclaration = (statement) => {
  const node =
    statement.type === 'ExportNamedDeclaration'
      ? statement.declaration
      : statement;

  switch (node?.type) {
    case 'ClassDeclaration': {
      return node.id
        ? { group: GROUPS.class, name: node.id.name, node, statement }
        : undefined;
    }

    case 'FunctionDeclaration':
    case 'TSDeclareFunction': {
      return node.id && !node.declare
        ? { group: GROUPS.function, name: node.id.name, node, statement }
        : undefined;
    }

    case 'TSInterfaceDeclaration':
    case 'TSTypeAliasDeclaration': {
      return { group: GROUPS.type, name: node.id.name, node, statement };
    }

    case 'VariableDeclaration': {
      const [declarator] = node.declarations;

      if (
        node.declare ||
        node.declarations.length !== 1 ||
        declarator.id.type !== 'Identifier'
      ) {
        return undefined;
      }

      const { name } = declarator.id;

      if (FUNCTION_TYPES.has(declarator.init?.type)) {
        return { group: GROUPS.function, name, node, statement };
      }

      const isConstant = node.kind === 'const' && /^[A-Z][\dA-Z_]*$/.test(name);

      return {
        group: isConstant ? GROUPS.constant : GROUPS.variable,
        name,
        node,
        statement,
      };
    }

    default: {
      return undefined;
    }
  }
};

/**
 * Returns the runs of consecutive top-level declarations, which imports and other
 * statements separate.
 *
 * @param {any[]} statements
 * @return {Declaration[][]}
 */
export const getDeclarationRuns = (statements) => {
  /** @type {Declaration[][]} */
  const runs = [];
  /** @type {Declaration[]} */
  let run = [];

  for (const statement of statements) {
    const declaration = getDeclaration(statement);

    if (declaration) {
      run.push(declaration);
    } else {
      runs.push(run);
      run = [];
    }
  }

  runs.push(run);

  return runs.filter((declarations) => {
    return declarations.length > 0;
  });
};

/**
 * Returns the declarations of a run that each declaration uses while the module
 * loads, ignoring type references. A function or class that runs while the module
 * loads also runs what it uses, so that counts too, e.g. `Z` for
 * `const VALUE = getValue()` where `getValue()` returns `Z`.
 *
 * @param {import('eslint').SourceCode} sourceCode
 * @param {Declaration[]} declarations
 * @return {Map<Declaration, Set<Declaration>>}
 */
export const getLoadTimeDependencies = (sourceCode, declarations) => {
  /** @type {Map<Declaration, Set<Declaration>>} */
  const allReferences = new Map();
  /** @type {Map<Declaration, Set<Declaration>>} */
  const loadTimeReferences = new Map();

  for (const declaration of declarations) {
    allReferences.set(declaration, new Set());
    loadTimeReferences.set(declaration, new Set());
  }

  for (const dependency of declarations) {
    const variable = getModuleVariable(sourceCode, dependency.name);

    for (const reference of variable?.references ?? []) {
      if (/** @type {any} */ (reference).isValueReference === false) {
        continue;
      }

      const identifier = /** @type {any} */ (reference.identifier);
      const user = declarations.find((declaration) => {
        return (
          declaration.name !== dependency.name &&
          identifier.range[0] >= declaration.statement.range[0] &&
          identifier.range[1] <= declaration.statement.range[1]
        );
      });

      if (!user) {
        continue;
      }

      allReferences.get(user)?.add(dependency);

      if (isLoadTimeReference(sourceCode, identifier, user.statement)) {
        loadTimeReferences.get(user)?.add(dependency);
      }
    }
  }

  return new Map(
    declarations.map((declaration) => {
      /** @type {Set<Declaration>} */
      const dependencies = new Set();
      const queue = [...(loadTimeReferences.get(declaration) ?? [])];

      while (queue.length > 0) {
        const dependency = queue.shift();

        if (
          !dependency ||
          dependency === declaration ||
          dependencies.has(dependency)
        ) {
          continue;
        }

        dependencies.add(dependency);

        if (
          dependency.group === GROUPS.class ||
          dependency.group === GROUPS.function
        ) {
          queue.push(...(allReferences.get(dependency) ?? []));
        }
      }

      return [declaration, dependencies];
    }),
  );
};

/**
 * Returns the module's top-level variable of a name.
 *
 * @param {import('eslint').SourceCode} sourceCode
 * @param {string} name
 * @return {import('eslint').Scope.Variable | undefined}
 */
export const getModuleVariable = (sourceCode, name) => {
  const { globalScope } = sourceCode.scopeManager;
  const moduleScope =
    globalScope?.childScopes.find((scope) => {
      return scope.type === 'module';
    }) ?? globalScope;

  return moduleScope?.set.get(name);
};

/**
 * Returns whether a reference runs while its top-level statement runs, i.e. not
 * inside a function body or an instance field initializer.
 *
 * @param {import('eslint').SourceCode} sourceCode
 * @param {any} identifier
 * @param {any} statement
 * @return {boolean}
 */
export const isLoadTimeReference = (sourceCode, identifier, statement) => {
  const ancestors = /** @type {any[]} */ (sourceCode.getAncestors(identifier));

  for (const ancestor of ancestors.toReversed()) {
    if (ancestor === statement) {
      return true;
    }

    if (FUNCTION_TYPES.has(ancestor.type)) {
      return false;
    }

    const isInstanceFieldValue =
      (ancestor.type === 'PropertyDefinition' ||
        ancestor.type === 'AccessorProperty') &&
      !ancestor.static &&
      ancestor.value &&
      identifier.range[0] >= ancestor.value.range[0] &&
      identifier.range[1] <= ancestor.value.range[1];

    if (isInstanceFieldValue) {
      return false;
    }
  }

  return true;
};
