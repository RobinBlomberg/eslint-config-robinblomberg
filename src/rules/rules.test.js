import typescriptEslintParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import commentStyle from './comment-style.js';
import preferArrowFunctions from './prefer-arrow-functions.js';
import sortDeclarations from './sort-declarations.js';
import sortTests from './sort-tests.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    parser: typescriptEslintParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module',
  },
});

ruleTester.run('comment-style', commentStyle, {
  invalid: [
    {
      code: '// Adds one.\nconst value = 1;',
      errors: [{ messageId: 'missingColon' }],
    },
    {
      code: '/** Adds one. */\nconst value = 1;',
      errors: [{ messageId: 'singleLineBlock' }],
    },
    {
      code: '// Adds one:\nconst add = (value: number) => {\n  return value + 1;\n};',
      errors: [{ messageId: 'functionNeedsJSDoc' }],
    },
    {
      code: `// ${'a'.repeat(83)}:\nconst value = 1;`,
      errors: [{ messageId: 'tooLong' }],
    },
  ],
  valid: [
    '// Adds one:\nconst value = 1;',
    // A comment that isn't attached to the code below:
    '// Values\n\nconst value = 1;',
    '// @ts-expect-error - The reason.\n// More about the reason.\nconst value = 1;',
    "// 'rule': 'warn',\nconst value = 1;",
    'const value = /** @type {any} */ (1);',
    'const element = <div>{/* A comment */}</div>;',
    'add(/* isFinal */ true);',
    "const THEME = {\n  // Extra components:\n  badge: () => {\n    return '';\n  },\n};",
    '// TODO: Remove this\nconst value = 1;',
    `/**\n * @example\n * \`\`\`ts\n * ${'a'.repeat(90)}\n * \`\`\`\n */\nconst value = 1;`,
    '/**\n * Adds one.\n */\nconst add = (value: number) => {\n  return value + 1;\n};',
    `// ${'a'.repeat(81)}:\nconst value = 1;`,
  ],
});

ruleTester.run('prefer-arrow-functions', preferArrowFunctions, {
  invalid: [
    {
      code: 'export async function add(value: number): Promise<number> {\n  return value + 1;\n}',
      errors: [{ messageId: 'preferArrowFunction' }],
      output:
        'export const add = async (value: number): Promise<number> => {\n  return value + 1;\n};',
    },
    {
      code: 'function identity<T>(value: T): T {\n  return value;\n}',
      errors: [{ messageId: 'preferArrowFunction' }],
      filename: 'identity.tsx',
      output: 'const identity = <T,>(value: T): T => {\n  return value;\n};',
    },
    {
      // Only used lazily, so it doesn't need hoisting:
      code: 'const HANDLERS = { add: () => add(1) };\nfunction add(value: number): number {\n  return value + 1;\n}',
      errors: [{ messageId: 'preferArrowFunction' }],
      output:
        'const HANDLERS = { add: () => add(1) };\nconst add = (value: number): number => {\n  return value + 1;\n};',
    },
    {
      code: 'const add = function (value: number) {\n  return value + 1;\n};',
      errors: [{ messageId: 'preferArrowFunction' }],
    },
  ],
  valid: [
    'function* range() {\n  yield 1;\n}',
    'function getThis() {\n  return this;\n}',
    'function add(value: number): number;\nfunction add(value: string): string;\nfunction add(value: any) {\n  return value;\n}',
    // Nested functions that run before their declarations, directly or not:
    'const run = () => {\n  outer();\n  function outer() {\n    inner();\n  }\n  function inner() {}\n};',
    // Used while the module loads, before its declaration:
    'const VALUE = add(1);\nfunction add(value: number): number {\n  return value + 1;\n}',
    // Used through another function that runs while the module loads:
    'const VALUE = double(1);\nfunction double(value: number): number {\n  return add(value) * 2;\n}\nfunction add(value: number): number {\n  return value + 1;\n}',
  ],
});

ruleTester.run('sort-declarations', sortDeclarations, {
  invalid: [
    {
      code: 'const run = () => {\n  const b = () => {};\n  const a = () => {};\n};',
      errors: [{ messageId: 'misplacedLocalFunction' }],
      output:
        'const run = () => {\n  const a = () => {};\n  const b = () => {};\n};',
    },
    {
      code: 'export const b = () => {};\nconst a = () => {};',
      errors: [{ messageId: 'misplaced' }],
      output: 'const a = () => {};\nexport const b = () => {};',
    },
    {
      code: 'const run = () => {};\n\nconst MAX = 1;',
      errors: [{ messageId: 'misplaced' }],
      output: 'const MAX = 1;\n\nconst run = () => {};',
    },
    {
      code: 'const B = 1; // Why B\nconst A = 2; // Why A',
      errors: [{ messageId: 'misplaced' }],
      output: 'const A = 2; // Why A\nconst B = 1; // Why B',
    },
    {
      // An arrow function that runs while the module loads can't move below:
      code: 'const add = () => {\n  return 1;\n};\n\nconst VALUE = add();',
      errors: [{ messageId: 'needsHoisting' }],
      output: null,
    },
    {
      code: 'type B = 1;\n\n/**\n * The first.\n */\ntype A = 2;',
      errors: [{ messageId: 'misplaced' }],
      output: '/**\n * The first.\n */\ntype A = 2;\n\ntype B = 1;',
    },
  ],
  valid: [
    'type A = 1;\n\nconst MAX = 1;\n\nlet count = 0;\n\nconst add = () => {};\n\nclass Item {}',
    'export const a = () => {};\nconst b = () => {};\nexport const c = () => {};',
    // A constant before a function that it uses while the module loads:
    'const VALUE = add(1);\n\nfunction add(value: number): number {\n  return value + 1;\n}',
    // `SURFACES` is used while `COLORS` loads:
    'const SURFACES = 1;\nconst COLORS = SURFACES + 1;',
    // `Z` is used while `A_VALUE` loads, through `getValue()`:
    'const Z = 1;\nconst A_VALUE = getValue();\n\nfunction getValue(): number {\n  return Z;\n}',
    // A class can't be hoisted, so it stays above a constant that uses it:
    'class Item {}\n\nconst ITEM = new Item();',
    // Types don't run, so they don't change the order:
    'class A {\n  b?: B;\n}\nclass B {}',
    // Other local declarations keep the order that they run in:
    'const run = () => {\n  const startedAt = now();\n  const result = work();\n};',
    // Local functions are only sorted within a run of consecutive ones:
    'const run = () => {\n  const b = () => {};\n  setUp();\n  const a = () => {};\n};',
  ],
});

ruleTester.run('sort-tests', sortTests, {
  invalid: [
    {
      code: "describe('a', () => {\n  it('should b', () => {});\n  it('should a', () => {});\n});",
      errors: [{ messageId: 'unsorted' }],
    },
  ],
  valid: [
    "describe('a', () => {\n  it('should a', () => {});\n  it('should b', () => {});\n});",
    "describe('b', () => {});\nconst value = 1;\ndescribe('a', () => {});",
  ],
});
