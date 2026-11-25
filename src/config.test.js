import { ESLint } from 'eslint';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import config from './index.js';

const eslint = new ESLint({
  overrideConfig: [
    ...config,
    {
      files: ['**/*.ts', '**/*.tsx'],
      // The snippets aren't files of a project, so they get a default one:
      languageOptions: {
        parserOptions: {
          project: false,
          projectService: { allowDefaultProject: ['example.ts'] },
          tsconfigRootDir: join(import.meta.dirname, '..'),
        },
      },
    },
  ],
  overrideConfigFile: true,
});

/**
 * Returns the messages of one rule for a TypeScript snippet.
 *
 * @param {string} code
 * @param {string} ruleId
 * @return {Promise<string[]>}
 */
const getMessages = async (code, ruleId) => {
  const [result] = await eslint.lintText(code, { filePath: 'example.ts' });

  return (result?.messages ?? [])
    .filter((message) => {
      return message.ruleId === ruleId || message.fatal;
    })
    .map((message) => {
      return message.message;
    });
};

// Class members are in the order of the conventions:
assert.deepEqual(
  await getMessages(
    [
      'export class Example {',
      '  static count = 0;',
      '  static create(): void {}',
      '  #secret = 1;',
      "  name = '';",
      '  constructor() {}',
      '  #run(): void {}',
      '  get size(): number {',
      '    return this.#secret;',
      '  }',
      '  [compareSymbol](): number {',
      '    return 0;',
      '  }',
      '  [INSPECT_CUSTOM](): string {',
      "    return '';",
      '  }',
      '  *[Symbol.iterator](): Generator<number> {}',
      '  add(): void {}',
      '}',
    ].join('\n'),
    'perfectionist/sort-classes',
  ),
  [],
);

// Symbol-keyed methods come before the other public methods:
assert.deepEqual(
  await getMessages(
    [
      'export class Example {',
      '  add(): void {}',
      '  *[Symbol.iterator](): Generator<number> {}',
      '}',
    ].join('\n'),
    'perfectionist/sort-classes',
  ),
  [
    'Expected "Symbol.iterator" (symbol-methods) to come before "add" (public-methods).',
  ],
);

// Packages come first, then parent, sibling and side-effect imports:
assert.deepEqual(
  await getMessages(
    [
      "import { compare } from '@q0/lib';",
      "import { join } from 'node:path';",
      "import type { ReactElement } from 'react';",
      "import { add } from '../add';",
      "import { subtract } from './subtract';",
      "import './styles.css';",
    ].join('\n'),
    'perfectionist/sort-imports',
  ),
  [],
);

// Comments start groups that are sorted on their own:
assert.deepEqual(
  await getMessages(
    [
      'export const articles = new Set([',
      '  // English:',
      "  'a',",
      "  'the',",
      '  // French:',
      "  'la',",
      "  'une',",
      "  'le',",
      ']);',
    ].join('\n'),
    'perfectionist/sort-sets',
  ),
  ['Expected "le" to come before "une".'],
);

// Named types come first in intersections:
assert.deepEqual(
  await getMessages(
    [
      "export type Style = CSSProperties & { '--size': string };",
      "export type Swapped = { '--size': string } & CSSProperties;",
    ].join('\n'),
    'perfectionist/sort-intersection-types',
  ),
  [
    'Expected "CSSProperties" (named) to come before "{ \'--size\': string }" (unknown).',
  ],
);

// `null` and `undefined` come last in unions:
assert.deepEqual(
  await getMessages(
    [
      'export type Name = number | string | null | undefined;',
      'export type Swapped = null | string;',
    ].join('\n'),
    'perfectionist/sort-union-types',
  ),
  ['Expected "string" (unknown) to come before "null" (nullish).'],
);

// Identifiers don't end in `_`:
assert.deepEqual(
  await getMessages(
    [
      'export const MAX_COUNT = 1;',
      'export const _private = 2;',
      'export const index_ = 3;',
    ].join('\n'),
    'id-match',
  ),
  [
    "Identifier 'index_' does not match the pattern '^[$_]$|^[$_]?[_A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?$'.",
  ],
);

// Placeholders and conventional one-character names are allowed, e.g. cheerio's `$`:
assert.deepEqual(
  await getMessages(
    [
      'export const values = [[1, 2]].map(([x, y]) => {',
      '  return x + y;',
      '});',
      'export const select = ($: (selector: string) => unknown) => {',
      "  return $('a');",
      '};',
      'export const count = (a: number) => {',
      '  return a;',
      '};',
    ].join('\n'),
    'id-length',
  ),
  ["Identifier name 'a' is too short (< 2)."],
);

// Sorting is case-insensitive, like the `robinblomberg` rules:
assert.deepEqual(
  await getMessages(
    'export const value = { apple: 1, Banana: 2, cherry: 3 };',
    'perfectionist/sort-objects',
  ),
  [],
);
