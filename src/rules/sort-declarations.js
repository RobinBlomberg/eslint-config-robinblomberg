import {
  compareNames,
  getDeclaration,
  getDeclarationRuns,
  getLoadTimeDependencies,
  GROUP_NAMES,
  GROUPS,
} from './module-declarations.js';

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  create: (context) => {
    const { sourceCode } = context;

    /**
     * Checks the runs of consecutive local function definitions in a block. Other
     * local declarations keep their order, since it can matter when they run.
     *
     * @param {any} block
     */
    const checkLocalFunctions = (block) => {
      for (const declarations of getLocalFunctionRuns(block.body)) {
        const expected = declarations.toSorted((first, second) => {
          return compareNames(first.name, second.name);
        });

        reportMisplaced(declarations, expected, 'misplacedLocalFunction');
      }
    };

    /**
     * Returns where a declaration ends, including comments after it on its last
     * line, e.g. `const MAX = 3; // The most`.
     *
     * @param {Declaration} declaration
     */
    const getEnd = (declaration) => {
      const trailingComments = sourceCode
        .getCommentsAfter(declaration.statement)
        .filter((comment) => {
          return (
            /** @type {any} */ (comment).loc.start.line ===
            declaration.statement.loc.end.line
          );
        });

      return (
        /** @type {any} */ (trailingComments.at(-1))?.range[1] ??
        declaration.statement.range[1]
      );
    };

    /**
     * Returns the text of each declaration with its leading comments, and whether a
     * blank line separated it from the one before.
     *
     * @param {Declaration[]} declarations
     */
    const getPieces = (declarations) => {
      return declarations.map((declaration, index) => {
        const previous = declarations[index - 1];
        // Comments on the line where the previous declaration ends belong to it:
        const firstComment = sourceCode
          .getCommentsBefore(declaration.statement)
          .find((comment) => {
            return (
              !previous ||
              /** @type {any} */ (comment).loc.start.line >
                previous.statement.loc.end.line
            );
          });
        const start =
          /** @type {any} */ (firstComment)?.range[0] ??
          declaration.statement.range[0];
        const end = getEnd(declaration);
        const separator = previous
          ? sourceCode.text.slice(getEnd(previous), start)
          : '';

        return {
          declaration,
          end,
          hasBlankLineBefore: /\n[^\S\n]*\n/.test(separator),
          start,
          text: sourceCode.text.slice(start, end),
        };
      });
    };

    /**
     * Reports the first declaration that isn't in its expected place, with a fix
     * that moves every declaration of the run, with its comments, into place.
     *
     * The fix is left out when it would move a declaration after a declaration that
     * uses it while the module loads, which only a function declaration survives,
     * since it's hoisted.
     *
     * @param {Declaration[]} declarations
     * @param {Declaration[]} expected
     * @param {'misplaced' | 'misplacedLocalFunction'} messageId
     * @param {Map<Declaration, Set<Declaration>>} [dependencies]
     */
    const reportMisplaced = (
      declarations,
      expected,
      messageId,
      dependencies = new Map(),
    ) => {
      const index = expected.findIndex((declaration, position) => {
        return declaration !== declarations[position];
      });
      const misplaced = expected[index];
      const displaced = declarations[index];

      if (!misplaced || !displaced) {
        return;
      }

      const unhoistedDependency = expected
        .flatMap((declaration, position) => {
          return [...(dependencies.get(declaration) ?? [])].filter(
            (dependency) => {
              return (
                expected.indexOf(dependency) > position &&
                dependency.node.type !== 'FunctionDeclaration' &&
                dependency.node.type !== 'TSDeclareFunction'
              );
            },
          );
        })
        .at(0);

      context.report({
        data: {
          dependency: unhoistedDependency?.name ?? '',
          displaced: displaced.name,
          displacedGroup: GROUP_NAMES[displaced.group] ?? '',
          misplaced: misplaced.name,
          misplacedGroup: GROUP_NAMES[misplaced.group] ?? '',
        },
        fix: (fixer) => {
          if (unhoistedDependency) {
            return null;
          }

          const pieces = getPieces(declarations);
          const [firstPiece] = pieces;
          const lastPiece = pieces.at(-1);

          if (!firstPiece || !lastPiece) {
            return null;
          }

          // The declarations of a run share the indentation of their block:
          const indentation =
            /^\s*/.exec(
              sourceCode.lines[
                firstPiece.declaration.statement.loc.start.line - 1
              ] ?? '',
            )?.[0] ?? '';
          const replacement = expected
            .map((declaration, position) => {
              const piece = pieces.find((candidate) => {
                return candidate.declaration === declaration;
              });
              const previous = expected[position - 1];

              if (!piece || !previous) {
                return piece?.text ?? '';
              }

              // Groups are separated by a blank line. The first piece has no
              // spacing of its own, so it takes the spacing after it:
              const ownSpacing =
                piece === firstPiece
                  ? (pieces[1]?.hasBlankLineBefore ?? true)
                  : piece.hasBlankLineBefore;
              const hasBlankLine =
                previous.group !== declaration.group || ownSpacing;

              return `${hasBlankLine ? '\n\n' : '\n'}${indentation}${piece.text}`;
            })
            .join('');

          return fixer.replaceTextRange(
            [firstPiece.start, lastPiece.end],
            replacement,
          );
        },
        messageId: unhoistedDependency ? 'needsHoisting' : messageId,
        node: misplaced.statement,
      });
    };

    return {
      BlockStatement: checkLocalFunctions,
      'Program:exit': (/** @type {any} */ program) => {
        for (const declarations of getDeclarationRuns(program.body)) {
          const dependencies = getLoadTimeDependencies(
            sourceCode,
            declarations,
          );

          reportMisplaced(
            declarations,
            getExpectedOrder(declarations, dependencies),
            'misplaced',
            dependencies,
          );
        }
      },
      StaticBlock: checkLocalFunctions,
    };
  },
  meta: {
    docs: {
      description:
        'Sort top-level declarations by group (types, constants, variables, functions, classes), then alphabetically, ignoring `export`, and consecutive local function definitions alphabetically.',
    },
    fixable: 'code',
    messages: {
      misplaced:
        'Expected {{misplacedGroup}} `{{misplaced}}` before {{displacedGroup}} `{{displaced}}`. Sort declarations by group (types, constants, variables, functions, classes), then alphabetically, ignoring `export`. Only a declaration that another one in its group uses while the module loads may come out of alphabetical order.',
      misplacedLocalFunction:
        'Expected local function `{{misplaced}}` before `{{displaced}}`. Sort consecutive local function definitions alphabetically. Other local declarations keep the order they need to run in.',
      needsHoisting:
        'Expected {{misplacedGroup}} `{{misplaced}}` before {{displacedGroup}} `{{displaced}}`, but `{{dependency}}` is used while the module loads, before where it would be declared. Make `{{dependency}}` a function declaration, which is hoisted, and then sort the declarations.',
    },
    schema: [],
    type: 'suggestion',
  },
};

/**
 * @typedef {import('./module-declarations.js').Declaration} Declaration
 */

/**
 * Returns the declarations in their expected order: by group, then alphabetically,
 * except that a declaration comes after what it uses while the module loads. Only
 * functions don't count, since they're expected to be hoisted function
 * declarations, so that the groups take priority.
 *
 * @param {Declaration[]} declarations
 * @param {Map<Declaration, Set<Declaration>>} dependencies
 * @return {Declaration[]}
 */
const getExpectedOrder = (declarations, dependencies) => {
  /** @type {Declaration[]} */
  const sorted = [];
  const remaining = new Set(declarations);

  const compareDeclarations = (
    /** @type {Declaration} */ first,
    /** @type {Declaration} */ second,
  ) => {
    return (
      first.group - second.group ||
      compareNames(first.name, second.name) ||
      declarations.indexOf(first) - declarations.indexOf(second)
    );
  };

  while (remaining.size > 0) {
    const [ready] = [...remaining]
      .filter((declaration) => {
        return [...(dependencies.get(declaration) ?? [])].every(
          (dependency) => {
            return (
              dependency.group === GROUPS.function || !remaining.has(dependency)
            );
          },
        );
      })
      .toSorted(compareDeclarations);
    // A dependency cycle keeps the original order:
    const next = ready ?? [...remaining][0];

    if (!next) {
      break;
    }

    sorted.push(next);
    remaining.delete(next);
  }

  return sorted;
};

/**
 * Returns the runs of consecutive local function definitions in a block, e.g.
 * `const add = () => {}`, which other statements separate.
 *
 * @param {any[]} statements
 * @return {Declaration[][]}
 */
const getLocalFunctionRuns = (statements) => {
  /** @type {Declaration[][]} */
  const runs = [[]];

  for (const statement of statements) {
    const declaration = getDeclaration(statement);

    if (declaration?.group === GROUPS.function) {
      runs.at(-1)?.push(declaration);
    } else {
      runs.push([]);
    }
  }

  return runs.filter((declarations) => {
    return declarations.length > 1;
  });
};

export default rule;
