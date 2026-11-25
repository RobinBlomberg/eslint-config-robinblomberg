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
          projectService: {
            allowDefaultProject: [
              'example.test.ts',
              'example.ts',
              'example.tsx',
            ],
          },
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
 * @param {string} [filePath]
 * @return {Promise<string[]>}
 */
const getMessages = async (code, ruleId, filePath = 'example.ts') => {
  const [result] = await eslint.lintText(code, { filePath });

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

// A RegExp match always has an `index`:
assert.deepEqual(
  await getMessages(
    [
      'export const getIndex = (match: RegExpExecArray) => {',
      '  return match.index!;',
      '};',
      'export const getItem = (items: string[], index: number) => {',
      '  return items[index]!;',
      '};',
    ].join('\n'),
    'no-restricted-syntax',
  ),
  ['A RegExp match always has an `index`, so it needs no `!`.'],
);

// Built-ins instead of reimplementations:
assert.deepEqual(
  await getMessages(
    [
      'export const escape = (text: string) => {',
      "  return text.replaceAll(/[.*]/g, '\\\\$&');",
      '};',
    ].join('\n'),
    'no-restricted-syntax',
  ),
  ['Use `RegExp.escape()` instead of escaping by hand.'],
);

assert.deepEqual(
  await getMessages(
    [
      'export const copy = (value: object): unknown => {',
      '  return JSON.parse(JSON.stringify(value));',
      '};',
    ].join('\n'),
    'unicorn/prefer-structured-clone',
  ),
  [
    'Prefer `structuredClone(…)` over `JSON.parse(JSON.stringify(…))` to create a deep clone.',
  ],
);

// Theme values get named utilities, while runtime values like Base UI's are fine:
assert.deepEqual(
  await getMessages(
    [
      'export const Box = () => {',
      '  return <div className="bg-(--color-surface) w-(--anchor-width)" />;',
      '};',
      "export const PADDING = twMerge('p-[calc(1rem+2px)]');",
    ].join('\n'),
    'no-restricted-syntax',
    'example.tsx',
  ),
  [
    'Define the value as a named theme variable, e.g. `--color-surface`, and use its utility, e.g. `bg-surface`.',
    'Define the value as a named theme variable, e.g. `--color-surface`, and use its utility, e.g. `bg-surface`.',
  ],
);

// Tests use the real code, and say why when a mock is necessary:
assert.deepEqual(
  await getMessages(
    [
      "import { add } from './add.js';",
      '',
      "describe('add', () => {",
      "  it('should add', () => {",
      '    mock(() => {',
      '      return add(1, 2);',
      '    });',
      "    spyOn(console, 'log');",
      '  });',
      '});',
    ].join('\n'),
    'no-restricted-syntax',
    'example.test.ts',
  ),
  [
    'Test the real code. If a mock or stub is truly necessary, disable this with a reason.',
    'Test the real code. If a mock or stub is truly necessary, disable this with a reason.',
  ],
);

// Constants are in `SNAKE_CASE` and initialisms in capitals, unless a library's
// own spelling differs, e.g. `Cuid2`:
assert.deepEqual(
  await getMessages(
    [
      'export const maxCount = 1;',
      'export const MAX_COUNT = 2;',
      'export const ITEMS = [1];',
      'export const { a, b } = { a: 1, b: 2 };',
      'export const createCuid2 = () => {',
      "  return '';",
      '};',
      "export type UnicodeTr35Symbol = 'G';",
    ].join('\n'),
    '@typescript-eslint/naming-convention',
  ),
  [
    'Variable name `maxCount` must match one of the following formats: UPPER_CASE',
    'Type Alias name `UnicodeTr35Symbol` must not match the RegExp: /(?:Api|Ascii|Ast|Csp|Css|Csv|Dom|Fsrs|Html|Http|Ip|Iso|Json|Otp|Pdf|Rpc|Sql|Sse|Svg|Tr|Ui|Uri|Url|Utf|Uuid|Xml)(?![a-z])/u',
  ],
);

// Abbreviations are written out:
assert.deepEqual(
  await getMessages(
    'export const cfg = { debug: true };',
    'unicorn/prevent-abbreviations',
  ),
  [
    'The variable `cfg` should be named `config`. A more descriptive name will do too.',
  ],
);
