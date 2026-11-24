import { compareNames } from './module-declarations.js';

const TEST_FUNCTION_NAMES = new Set(['describe', 'it', 'test']);

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  create: (context) => {
    const checkStatements = (/** @type {any[]} */ statements) => {
      /** @type {{ statement: any; title: string }[]} */
      let run = [];

      const checkRun = () => {
        for (const [index, test] of run.entries()) {
          const previous = run[index - 1];

          if (previous && compareNames(previous.title, test.title) > 0) {
            context.report({
              data: { previous: previous.title, title: test.title },
              messageId: 'unsorted',
              node: test.statement,
            });
            break;
          }
        }
      };

      for (const statement of statements) {
        const title = getTestTitle(statement);

        if (title === undefined) {
          checkRun();
          run = [];
        } else {
          run.push({ statement, title });
        }
      }

      checkRun();
    };

    return {
      BlockStatement: (/** @type {any} */ node) => {
        checkStatements(node.body);
      },
      Program: (/** @type {any} */ node) => {
        checkStatements(node.body);
      },
    };
  },
  meta: {
    docs: {
      description:
        'Sort sibling `describe()`, `it()` and `test()` blocks alphabetically by title.',
    },
    messages: {
      unsorted:
        'Sort tests alphabetically: "{{title}}" should come before "{{previous}}".',
    },
    schema: [],
    type: 'suggestion',
  },
};

/**
 * Returns the title of a `describe()`, `it()` or `test()` call statement, including
 * e.g. `it.skip()`, or `undefined` for other statements and dynamic titles.
 *
 * @param {any} statement
 * @return {string | undefined}
 */
const getTestTitle = (statement) => {
  const call =
    statement.type === 'ExpressionStatement' ? statement.expression : undefined;

  if (call?.type !== 'CallExpression') {
    return undefined;
  }

  const { callee } = call;
  const name =
    callee.type === 'MemberExpression' ? callee.object.name : callee.name;

  if (!TEST_FUNCTION_NAMES.has(name)) {
    return undefined;
  }

  const [title] = call.arguments;

  if (title?.type === 'Literal' && typeof title.value === 'string') {
    return title.value;
  }

  if (title?.type === 'TemplateLiteral' && title.expressions.length === 0) {
    return title.quasis[0]?.value.cooked ?? undefined;
  }

  return undefined;
};

export default rule;
