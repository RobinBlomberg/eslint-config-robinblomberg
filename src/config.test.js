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
      '  add(): void {}',
      '}',
    ].join('\n'),
    'perfectionist/sort-classes',
  ),
  [],
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

// Sorting is case-insensitive, like the `robinblomberg` rules:
assert.deepEqual(
  await getMessages(
    'export const value = { apple: 1, Banana: 2, cherry: 3 };',
    'perfectionist/sort-objects',
  ),
  [],
);
