const DIRECTIVE_REGEXP =
  /^\s*(?:@ts-|@vite-ignore|[#@]__PURE__|biome-ignore|c8 |cspell|eslint|exported |global |globals |istanbul |prettier-ignore|webpack[A-Z])/;

const FUNCTION_TYPES = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
  'TSDeclareFunction',
]);

// A call like `run()` or `items.at()`, which belongs in backticks:
const IDENTIFIER_CALL_REGEXP =
  /(?:^|[\s(])([$A-Z_a-z][\w$]*(?:\.[$A-Z_a-z][\w$]*)*\(\))/;

const MAX_LINE_LENGTH = 85;

// Notes that aren't descriptions of the code below, e.g. `// TODO: Remove`:
const NOTE_REGEXP = /^\s*(?:FIXME|HACK|NOTE|TODO|XXX)\b/;

// A comment that divides sections, e.g. `// --- Types ---` or `/* ====== */`:
const SECTION_DIVIDER_REGEXP = /^\s*[-#*=_~]{3,}|[-#*=_~]{3,}\s*$/;

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  create: (context) => {
    const { sourceCode } = context;

    const checkBlockComment = (/** @type {any} */ comment) => {
      const isSingleLine = comment.loc.start.line === comment.loc.end.line;

      // A JSDoc type cast, e.g. `/** @type {any} */ (value)`:
      const isTypeCast = /^\*\s*@(?:satisfies|type)\s/.test(comment.value);

      // Inline comments, e.g. `add(/* isFinal */ true)`, can't span several lines:
      if (
        isSingleLine &&
        isOwnLine(comment) &&
        !isDirective(comment) &&
        !isTypeCast &&
        !isJSXComment(comment)
      ) {
        context.report({ loc: comment.loc, messageId: 'singleLineBlock' });
      }

      const next = /** @type {any} */ (
        sourceCode.getTokenAfter(comment, { includeComments: true })
      );

      const isJSDocument = comment.value.startsWith('*');

      if (
        !isJSDocument &&
        !isDirective(comment) &&
        next &&
        next.type !== 'Block' &&
        next.type !== 'Line' &&
        next.loc.start.line === comment.loc.end.line + 1 &&
        isFunctionLike(getNodeAt(next))
      ) {
        context.report({ loc: comment.loc, messageId: 'functionNeedsJSDoc' });
      }
    };

    /**
     * Reports calls like `run()` that aren't wrapped in backticks, outside of code
     * examples.
     *
     * @param {any} comment
     */
    const checkIdentifiers = (comment) => {
      if (isDirective(comment)) {
        return;
      }

      let isInCodeBlock = false;

      for (const [index, line] of comment.value.split('\n').entries()) {
        if (/^\s*\*?\s*```/.test(line)) {
          isInCodeBlock = !isInCodeBlock;
          continue;
        }

        const prose = line.replaceAll(
          /`[^`]*`/g,
          (/** @type {string} */ code) => {
            return ' '.repeat(code.length);
          },
        );

        const match = isInCodeBlock ? null : IDENTIFIER_CALL_REGEXP.exec(prose);

        if (match) {
          const [, name = ''] = match;
          const column = match.index + match[0].length - name.length;
          const lineNumber = comment.loc.start.line + index;

          const startColumn =
            index === 0 ? comment.loc.start.column + 2 + column : column;

          context.report({
            data: { name },
            loc: {
              end: { column: startColumn + name.length, line: lineNumber },
              start: { column: startColumn, line: lineNumber },
            },
            messageId: 'identifierWithoutBackticks',
          });
        }
      }
    };

    /**
     * Checks a group of `//` comments on consecutive lines of their own.
     *
     * @param {any[]} group
     */
    const checkLineCommentGroup = (group) => {
      const last = group.at(-1);

      const next = /** @type {any} */ (
        sourceCode.getTokenAfter(last, { includeComments: true })
      );

      const isAttached =
        next &&
        next.type !== 'Block' &&
        next.type !== 'Line' &&
        next.loc.start.line === last.loc.end.line + 1 &&
        !(next.type === 'Punctuator' && [')', ']', '}'].includes(next.value));

      if (!isAttached) {
        return;
      }

      const isCommentedOutCode = /[,;[{]$/.test(last.value.trimEnd());

      const hasDirective = group.some((comment) => {
        return isDirective(comment);
      });

      const isNote = group.some((comment) => {
        return NOTE_REGEXP.test(comment.value);
      });

      // E.g. the reason after `// @ts-expect-error` belongs to the directive:
      if (hasDirective || isCommentedOutCode) {
        return;
      }

      if (isFunctionLike(getNodeAt(next))) {
        context.report({ loc: group[0].loc, messageId: 'functionNeedsJSDoc' });

        return;
      }

      if (!isNote && !last.value.trimEnd().endsWith(':')) {
        context.report({ loc: last.loc, messageId: 'missingColon' });
      }
    };

    const checkLineLengths = (/** @type {any} */ comment) => {
      // A directive, e.g. `// eslint-disable-next-line rule -- Reason`, can't wrap:
      if (!isOwnLine(comment) || isDirective(comment)) {
        return;
      }

      let isInCodeBlock = false;

      for (
        let line = comment.loc.start.line;
        line <= comment.loc.end.line;
        line++
      ) {
        const text = sourceCode.lines[line - 1] ?? '';

        // Code in a JSDoc example, e.g. after `@example` in a ``` block, is code:
        if (/^\s*\*?\s*```/.test(text)) {
          isInCodeBlock = !isInCodeBlock;
          continue;
        }

        if (
          text.length > MAX_LINE_LENGTH &&
          !isInCodeBlock &&
          !text.includes('://')
        ) {
          context.report({
            data: { length: String(text.length), max: String(MAX_LINE_LENGTH) },
            loc: {
              end: { column: text.length, line },
              start: { column: MAX_LINE_LENGTH, line },
            },
            messageId: 'tooLong',
          });
        }
      }
    };

    const checkSectionDivider = (/** @type {any} */ comment) => {
      const isSingleLine = comment.loc.start.line === comment.loc.end.line;

      if (
        isSingleLine &&
        isOwnLine(comment) &&
        SECTION_DIVIDER_REGEXP.test(comment.value)
      ) {
        context.report({ loc: comment.loc, messageId: 'sectionDivider' });
      }
    };

    /**
     * Returns the node that starts at a token, e.g. the statement after a comment.
     *
     * @param {any} token
     * @return {any}
     */
    const getNodeAt = (token) => {
      let node = /** @type {any} */ (
        sourceCode.getNodeByRangeIndex(token.range[0])
      );

      while (
        node?.parent &&
        node.parent.type !== 'Program' &&
        node.parent.range[0] === token.range[0]
      ) {
        node = node.parent;
      }

      return node;
    };

    /**
     * Returns whether a block comment is a JSX comment, e.g. `{/* Title *\/}`.
     *
     * @param {any} comment
     * @return {boolean}
     */
    const isJSXComment = (comment) => {
      const node = /** @type {any} */ (
        sourceCode.getNodeByRangeIndex(comment.range[0])
      );

      return (
        node?.type === 'JSXExpressionContainer' ||
        node?.type === 'JSXEmptyExpression'
      );
    };

    /**
     * Returns whether a comment is the only thing on its lines.
     *
     * @param {any} comment
     * @return {boolean}
     */
    const isOwnLine = (comment) => {
      const lineStart = sourceCode.lines[comment.loc.start.line - 1] ?? '';
      const lineEnd = sourceCode.lines[comment.loc.end.line - 1] ?? '';

      return (
        lineStart.slice(0, comment.loc.start.column).trim() === '' &&
        lineEnd.slice(comment.loc.end.column).trim() === ''
      );
    };

    return {
      Program: () => {
        const comments = /** @type {any[]} */ (sourceCode.getAllComments());

        /** @type {any[]} */
        let group = [];

        for (const comment of comments) {
          checkIdentifiers(comment);
          checkLineLengths(comment);
          checkSectionDivider(comment);

          if (comment.type === 'Block') {
            checkBlockComment(comment);
          }

          const isGroupable = comment.type === 'Line' && isOwnLine(comment);
          const previous = group.at(-1);

          if (
            isGroupable &&
            previous &&
            comment.loc.start.line === previous.loc.end.line + 1
          ) {
            group.push(comment);
            continue;
          }

          if (group.length > 0) {
            checkLineCommentGroup(group);
          }

          group = isGroupable ? [comment] : [];
        }

        if (group.length > 0) {
          checkLineCommentGroup(group);
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'Keep comments to 85 characters per line, write block comments over several lines, end `//` comments that describe the code below with a colon, describe functions with JSDoc, wrap calls like `run()` in backticks, and leave out section dividers.',
    },
    messages: {
      functionNeedsJSDoc:
        'Describe a function with a JSDoc comment (`/** ... */` over several lines) instead.',
      identifierWithoutBackticks: 'Wrap `{{name}}` in backticks.',
      missingColon:
        'End a comment that describes the code below with a colon (`:`) instead of a period.',
      sectionDivider:
        "Leave out section-dividing comments, e.g. `// --- Types ---`. The file's structure is its own order.",
      singleLineBlock:
        'Write block and JSDoc comments over several lines: `/**`, ` * ...` and ` */` each on a line of their own.',
      tooLong:
        'Comment lines can be at most {{max}} characters long ({{length}}). Break the line where it would exceed {{max}} characters, and not earlier.',
    },
    schema: [],
    type: 'suggestion',
  },
};

/**
 * Returns whether a comment is a tool directive rather than prose, e.g.
 * `// eslint-disable-next-line` or `// @ts-expect-error`.
 *
 * @param {any} comment
 * @return {boolean}
 */
const isDirective = (comment) => {
  return (
    DIRECTIVE_REGEXP.test(comment.value) ||
    // Triple-slash directives, e.g. `/// <reference types="vite/client" />`:
    (comment.type === 'Line' && comment.value.startsWith('/'))
  );
};

/**
 * Returns whether a node declares or is a function, e.g. a function declaration,
 * an arrow function in a variable, or a method. Object properties don't count,
 * since a comment above one can label a group of properties.
 *
 * @param {any} node
 * @return {boolean}
 */
const isFunctionLike = (node) => {
  const declaration =
    node.type === 'ExportNamedDeclaration' ||
    node.type === 'ExportDefaultDeclaration'
      ? node.declaration
      : node;

  if (!declaration) {
    return false;
  }

  if (FUNCTION_TYPES.has(declaration.type)) {
    return true;
  }

  if (declaration.type === 'VariableDeclaration') {
    return declaration.declarations.some((/** @type {any} */ declarator) => {
      return FUNCTION_TYPES.has(declarator.init?.type);
    });
  }

  return (
    (declaration.type === 'MethodDefinition' ||
      declaration.type === 'PropertyDefinition') &&
    FUNCTION_TYPES.has(declaration.value?.type)
  );
};

export default rule;
