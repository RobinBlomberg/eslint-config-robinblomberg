const IS_DEVELOPMENT = !process.env.CI && process.env.NODE_ENV !== 'production';
const error = 'error';
const off = 'off';
const warn = IS_DEVELOPMENT ? 'warn' : 'error';
const offDuringDevelopment = IS_DEVELOPMENT ? off : warn;

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  globals: {
    globalThis: true
  },
  ignorePatterns: [
    '**/.*/**'
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      globals: {
        NodeJS: true
      },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json'
      },
      plugins: [
        'typescript',
        '@typescript-eslint'
      ],
      rules: {
        '@typescript-eslint/adjacent-overload-signatures': warn,
        '@typescript-eslint/array-type': [warn, {
          default: 'array'
        }],
        '@typescript-eslint/await-thenable': warn,
        '@typescript-eslint/ban-ts-comment': warn,
        '@typescript-eslint/ban-tslint-comment': warn,
        '@typescript-eslint/ban-types': [
          warn,
          {
            extendDefaults: true,
            types: {
              '{}': false,
              Function: false
            }
          }
        ],
        '@typescript-eslint/brace-style': warn,
        '@typescript-eslint/camelcase': off,
        '@typescript-eslint/class-literal-property-style': [warn, 'fields'],
        '@typescript-eslint/comma-dangle': [warn, 'never'],
        '@typescript-eslint/comma-spacing': [warn, { after: true, before: false }],
        '@typescript-eslint/consistent-type-assertions': [warn, {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never'
        }],
        '@typescript-eslint/consistent-type-definitions': [warn, 'type'],
        '@typescript-eslint/consistent-type-imports': [warn, {
          disallowTypeAnnotations: true,
          prefer: 'no-type-imports'
        }],
        '@typescript-eslint/default-param-last': warn,
        '@typescript-eslint/dot-notation': warn,
        '@typescript-eslint/explicit-function-return-type': [warn, {
          allowTypedFunctionExpressions: true
        }],
        '@typescript-eslint/explicit-member-accessibility': [warn, {
          accessibility: 'no-public'
        }],
        '@typescript-eslint/explicit-module-boundary-types': off,
        '@typescript-eslint/func-call-spacing': warn,
        '@typescript-eslint/indent': [warn, 2, {
          SwitchCase: 1,
          ignoredNodes: [
            'TSTypeParameterInstantiation',
            'TSUnionType'
          ]
        }],
        // Definition not found (2020-10-26):
        // '@typescript-eslint/index': warn,
        '@typescript-eslint/init-declarations': off,
        '@typescript-eslint/keyword-spacing': warn,
        '@typescript-eslint/lines-between-class-members': off,
        '@typescript-eslint/member-delimiter-style': [warn, {
          multiline: {
            delimiter: 'semi',
            requireLast: true
          },
          singleline: {
            delimiter: 'semi',
            requireLast: true
          }
        }],
        '@typescript-eslint/member-ordering': [warn, {
          default: [
            'signature',
            'private-static-field',
            'protected-static-field',
            'public-static-field',
            'private-static-method',
            'protected-static-method',
            'public-static-method',
            'private-decorated-field',
            'protected-decorated-field',
            'public-decorated-field',
            'private-instance-field',
            'protected-instance-field',
            'public-instance-field',
            'private-abstract-field',
            'protected-abstract-field',
            'public-abstract-field',
            'static-field',
            'private-field',
            'protected-field',
            'public-field',
            'instance-field',
            'abstract-field',
            'decorated-field',
            'field',
            'private-constructor',
            'protected-constructor',
            'public-constructor',
            'constructor',
            'private-decorated-method',
            'protected-decorated-method',
            'public-decorated-method',
            'private-instance-method',
            'protected-instance-method',
            'public-instance-method',
            'private-abstract-method',
            'protected-abstract-method',
            'public-abstract-method',
            'static-method',
            'private-method',
            'protected-method',
            'public-method',
            'instance-method',
            'abstract-method',
            'decorated-method',
            'method'
          ]
        }],
        '@typescript-eslint/method-signature-style': [warn, 'property'],
        '@typescript-eslint/naming-convention': [
          warn,
          {
            format: ['camelCase'],
            leadingUnderscore: 'allow',
            selector: 'default'
          },
          {
            format: ['PascalCase'],
            selector: [
              'class',
              'enum',
              'interface',
              'typeAlias',
              'typeParameter'
            ]
          },
          {
            format: ['camelCase', 'PascalCase'],
            selector: [
              'function'
            ]
          },
          {
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            selector: [
              'variable'
            ]
          },
          {
            format: ['UPPER_CASE'],
            selector: [
              'enumMember'
            ]
          },
          {
            format: null,
            selector: [
              'parameter',
              'property'
            ]
          }
        ],
        '@typescript-eslint/no-array-constructor': warn,
        '@typescript-eslint/no-base-to-string': warn,
        '@typescript-eslint/no-confusing-non-null-assertion': warn,
        '@typescript-eslint/no-dupe-class-members': warn,
        '@typescript-eslint/no-dynamic-delete': off,
        '@typescript-eslint/no-empty-function': off,
        '@typescript-eslint/no-empty-interface': warn,
        '@typescript-eslint/no-explicit-any': off,
        '@typescript-eslint/no-extra-non-null-assertion': warn,
        '@typescript-eslint/no-extra-parens': [warn, 'all', {
          nestedBinaryExpressions: false
        }],
        '@typescript-eslint/no-extra-semi': warn,
        '@typescript-eslint/no-extraneous-class': warn,
        '@typescript-eslint/no-floating-promises': [warn, {
          ignoreIIFE: true,
          ignoreVoid: true
        }],
        '@typescript-eslint/no-for-in-array': warn,
        '@typescript-eslint/no-implicit-any-catch': [warn, {
          allowExplicitAny: true
        }],
        '@typescript-eslint/no-implied-eval': warn,
        '@typescript-eslint/no-inferrable-types': warn,
        '@typescript-eslint/no-invalid-this': warn,
        '@typescript-eslint/no-invalid-void-type': off,
        '@typescript-eslint/no-loop-func': warn,
        '@typescript-eslint/no-loss-of-precision': warn,
        '@typescript-eslint/no-magic-numbers': [warn, {
          ignore: [-1, 0, 1, 2, 3],
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true
        }],
        '@typescript-eslint/no-misused-new': warn,
        '@typescript-eslint/no-misused-promises': off,
        '@typescript-eslint/no-namespace': [warn, {
          allowDeclarations: true
        }],
        '@typescript-eslint/no-non-null-asserted-optional-chain': warn,
        '@typescript-eslint/no-non-null-assertion': warn,
        '@typescript-eslint/no-parameter-properties': warn,
        '@typescript-eslint/no-redeclare': warn,
        '@typescript-eslint/no-require-imports': warn,
        '@typescript-eslint/no-shadow': warn,
        '@typescript-eslint/no-this-alias': warn,
        '@typescript-eslint/no-throw-literal': warn,
        '@typescript-eslint/no-type-alias': off,
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': warn,
        '@typescript-eslint/no-unnecessary-condition': off,
        '@typescript-eslint/no-unnecessary-qualifier': warn,
        '@typescript-eslint/no-unnecessary-type-arguments': off,
        '@typescript-eslint/no-unnecessary-type-assertion': warn,
        '@typescript-eslint/no-unsafe-assignment': off,
        '@typescript-eslint/no-unsafe-call': off,
        '@typescript-eslint/no-unsafe-member-access': off,
        '@typescript-eslint/no-unsafe-return': off,
        '@typescript-eslint/no-unused-expressions': warn,
        '@typescript-eslint/no-unused-vars': [warn, {
          args: 'none'
        }],
        '@typescript-eslint/no-use-before-define': [warn, {
          classes: false,
          functions: false,
          variables: false
        }],
        '@typescript-eslint/no-useless-constructor': error,
        '@typescript-eslint/no-var-requires': off,
        '@typescript-eslint/prefer-as-const': warn,
        '@typescript-eslint/prefer-enum-initializers': off,
        '@typescript-eslint/prefer-for-of': warn,
        '@typescript-eslint/prefer-function-type': warn,
        '@typescript-eslint/prefer-includes': warn,
        '@typescript-eslint/prefer-literal-enum-member': warn,
        '@typescript-eslint/prefer-namespace-keyword': warn,
        '@typescript-eslint/prefer-nullish-coalescing': warn,
        '@typescript-eslint/prefer-optional-chain': warn,
        '@typescript-eslint/prefer-readonly': warn,
        // Disabled due to error:
        // "Error: Non-null Assertion Failed: Expected to find a property "XXX" for the type."
        '@typescript-eslint/prefer-readonly-parameter-types': off,
        '@typescript-eslint/prefer-reduce-type-parameter': warn,
        '@typescript-eslint/prefer-regexp-exec': warn,
        '@typescript-eslint/prefer-string-starts-ends-with': off,
        '@typescript-eslint/prefer-ts-expect-error': warn,
        '@typescript-eslint/promise-function-async': off,
        '@typescript-eslint/quotes': [warn, 'single'],
        '@typescript-eslint/require-array-sort-compare': [warn, {
          ignoreStringArrays: true
        }],
        '@typescript-eslint/require-await': warn,
        '@typescript-eslint/restrict-plus-operands': warn,
        // Disabled due to false positives:
        '@typescript-eslint/restrict-template-expressions': off,
        '@typescript-eslint/return-await': warn,
        '@typescript-eslint/semi': [warn, 'always'],
        '@typescript-eslint/space-before-function-paren': [warn, 'never'],
        '@typescript-eslint/strict-boolean-expressions': off,
        '@typescript-eslint/switch-exhaustiveness-check': off,
        '@typescript-eslint/triple-slash-reference': warn,
        '@typescript-eslint/type-annotation-spacing': warn,
        '@typescript-eslint/typedef': off,
        '@typescript-eslint/unbound-method': warn,
        '@typescript-eslint/unified-signatures': warn,
        'default-case': off,
        'func-call-spacing': off,
        indent: off,
        'init-declarations': off,
        'keyword-spacing': off,
        'no-extra-parens': off,
        'no-extra-semi': off,
        'no-invalid-this': off,
        'no-loop-func': off,
        'no-loss-of-precision': off,
        'no-redeclare': off,
        'no-return-await': off,
        'no-shadow': off,
        'no-unused-expressions': off,
        'no-unused-vars': off,
        'no-use-before-define': off,
        'no-useless-constructor': off,
        'no-void': off,
        quotes: off,
        semi: off,
        'space-before-function-paren': off
      }
    },
    {
      files: [
        '**/spec/**',
        '**/test/**',
        '**/tests/**',
        '**/*.spec.*',
        '**/*.test.*'
      ],
      rules: {
        'jsdoc/require-jsdoc': off,
        'no-magic-numbers': off
      }
    }
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'import',
    'jsdoc'
  ],
  root: true,
  rules: {
    'accessor-pairs': warn,
    'array-bracket-newline': off,
    'array-bracket-spacing': [warn, 'never'],
    'array-callback-return': warn,
    'array-element-newline': [warn, 'consistent'],
    'arrow-body-style': off,
    'arrow-parens': [warn, 'always'],
    'arrow-spacing': [warn, { after: true, before: true }],
    'block-scoped-var': warn,
    'block-spacing': [warn, 'always'],
    'brace-style': [warn, '1tbs'],
    'callback-return': [warn, ['callback', 'cb', 'next']],
    camelcase: [off, { properties: 'never' }],
    'capitalized-comments': off,
    'class-methods-use-this': off,
    'comma-dangle': [warn, 'never'],
    'comma-spacing': [warn, { after: true, before: false }],
    'comma-style': [warn, 'last'],
    complexity: off,
    'computed-property-spacing': [warn, 'never'],
    'consistent-return': warn,
    'consistent-this': warn,
    'constructor-super': warn,
    curly: [warn, 'all'],
    'default-case': warn,
    'default-param-last': warn,
    'dot-location': [warn, 'property'],
    'dot-notation': [warn, { allowKeywords: true }],
    'eol-last': warn,
    eqeqeq: [warn, 'always', { null: 'ignore' }],
    'for-direction': warn,
    'func-call-spacing': [warn, 'never'],
    'func-name-matching': warn,
    'func-names': [off, 'as-needed'],
    'func-style': [off, 'expression'],
    'function-call-argument-newline': off,
    'function-paren-newline': off,
    'generator-star-spacing': [warn, { after: true, before: true }],
    'getter-return': warn,
    'global-require': off,
    'guard-for-in': warn,
    'handle-callback-err': [warn, '^(err|error)$'],
    'id-blacklist': warn,
    'id-length': off,
    'id-match': [off, '^_?[_A-Za-z][A-Za-z0-9_]*$'],
    'implicit-arrow-linebreak': [off, 'beside'],
    'import/default': warn,
    'import/dynamic-import-chunkname': warn,
    'import/export': warn,
    'import/exports-last': warn,
    'import/extensions': [warn, {
      js: 'always',
      json: 'always'
    }],
    'import/first': warn,
    'import/group-exports': off,
    'import/imports-first': warn,
    'import/max-dependencies': warn,
    'import/named': warn,
    'import/namespace': warn,
    'import/newline-after-import': warn,
    'import/no-absolute-path': warn,
    'import/no-amd': warn,
    'import/no-anonymous-default-export': warn,
    'import/no-commonjs': warn,
    'import/no-cycle': off,
    'import/no-default-export': warn,
    'import/no-deprecated': warn,
    'import/no-duplicates': warn,
    'import/no-dynamic-require': warn,
    'import/no-extraneous-dependencies': warn,
    'import/no-internal-modules': [warn, {
      allow: [
        '**/src/*.js',
        '**/index.js',
        '**/index.test.js'
      ]
    }],
    'import/no-mutable-exports': warn,
    'import/no-named-as-default': warn,
    'import/no-named-as-default-member': warn,
    'import/no-named-default': warn,
    'import/no-named-export': off,
    'import/no-namespace': off,
    'import/no-nodejs-modules': off,
    // Disabled due to false positives (e.g. "@robinblomberg/schema"):
    'import/no-relative-parent-imports': off,
    'import/no-restricted-paths': warn,
    'import/no-self-import': warn,
    'import/no-unassigned-import': warn,
    'import/no-unresolved': warn,
    'import/no-unused-modules': warn,
    'import/no-useless-path-segments': warn,
    'import/no-webpack-loader-syntax': warn,
    'import/order': [warn, {
      alphabetize: {
        caseInsensitive: false,
        order: 'asc'
      },
      groups: [
        'builtin',
        'external',
        'internal',
        'unknown',
        'parent',
        'sibling',
        'index',
        'object'
      ],
      'newlines-between': 'never'
    }],
    'import/prefer-default-export': off,
    'import/unambiguous': off,
    indent: [warn, 2, {
      SwitchCase: 1
    }],
    'init-declarations': off,
    'jsdoc/check-access': warn,
    'jsdoc/check-alignment': warn,
    'jsdoc/check-examples': warn,
    'jsdoc/check-indentation': warn,
    'jsdoc/check-line-alignment': warn,
    'jsdoc/check-param-names': warn,
    'jsdoc/check-property-names': warn,
    'jsdoc/check-syntax': warn,
    'jsdoc/check-tag-names': warn,
    'jsdoc/check-types': [warn, {
      noDefaults: true
    }],
    'jsdoc/check-values': warn,
    'jsdoc/empty-tags': warn,
    'jsdoc/implements-on-classes': warn,
    'jsdoc/match-description': warn,
    'jsdoc/newline-after-description': warn,
    'jsdoc/no-bad-blocks': warn,
    'jsdoc/no-defaults': warn,
    'jsdoc/no-types': off,
    'jsdoc/no-undefined-types': warn,
    'jsdoc/require-description': [off, {
      contexts: ['any'],
      descriptionStyle: 'body'
    }],
    'jsdoc/require-description-complete-sentence': off,
    'jsdoc/require-example': off,
    'jsdoc/require-file-overview': off,
    'jsdoc/require-hyphen-before-param-description': [warn, 'never'],
    'jsdoc/require-jsdoc': [warn, {
      publicOnly: false,
      require: {
        ArrowFunctionExpression: true,
        ClassDeclaration: true,
        ClassExpression: true,
        FunctionDeclaration: true,
        FunctionExpression: true,
        MethodDefinition: true
      }
    }],
    'jsdoc/require-param': [warn, {
      checkConstructors: true,
      checkDestructured: true,
      checkDestructuredRoots: true,
      checkGetters: true,
      checkSetters: true
    }],
    'jsdoc/require-param-description': off,
    'jsdoc/require-param-name': warn,
    'jsdoc/require-param-type': [warn, {
      contexts: ['any']
    }],
    'jsdoc/require-property': warn,
    'jsdoc/require-property-description': warn,
    'jsdoc/require-property-name': warn,
    'jsdoc/require-property-type': warn,
    'jsdoc/require-returns': warn,
    'jsdoc/require-returns-check': warn,
    'jsdoc/require-returns-description': off,
    'jsdoc/require-returns-type': warn,
    'jsdoc/valid-types': off,
    'jsx-quotes': warn,
    'key-spacing': [warn, { afterColon: true, beforeColon: false }],
    'keyword-spacing': [off, { after: true, before: true }],
    'line-comment-position': off,
    'linebreak-style': off,
    'lines-around-comment': off,
    'lines-between-class-members': off,
    'max-classes-per-file': [off, 1],
    'max-depth': off,
    'max-len': [warn, {
      code: 100,
      ignoreComments: true,
      ignoreRegExpLiterals: true
    }],
    'max-lines': off,
    'max-lines-per-function': off,
    'max-nested-callbacks': warn,
    'max-params': off,
    'max-statements': off,
    'max-statements-per-line': [warn, { max: 1 }],
    'multiline-comment-style': off,
    'multiline-ternary': off,
    'new-cap': [warn, { capIsNew: false, newIsCap: true, properties: true }],
    'new-parens': warn,
    'newline-per-chained-call': off,
    'no-alert': off,
    'no-array-constructor': warn,
    'no-async-promise-executor': warn,
    'no-await-in-loop': off,
    'no-bitwise': warn,
    'no-buffer-constructor': warn,
    'no-caller': warn,
    'no-case-declarations': warn,
    'no-class-assign': warn,
    'no-compare-neg-zero': warn,
    'no-cond-assign': warn,
    'no-confusing-arrow': warn,
    'no-console': offDuringDevelopment,
    'no-const-assign': warn,
    'no-constant-condition': [warn, { checkLoops: false }],
    'no-continue': warn,
    'no-control-regex': off,
    'no-debugger': warn,
    'no-delete-var': warn,
    'no-div-regex': warn,
    'no-dupe-args': warn,
    'no-dupe-class-members': warn,
    'no-dupe-keys': warn,
    'no-duplicate-case': warn,
    'no-duplicate-imports': warn,
    'no-else-return': warn,
    'no-empty': [warn, { allowEmptyCatch: true }],
    'no-empty-character-class': warn,
    'no-empty-function': off,
    'no-empty-pattern': off,
    'no-eq-null': off,
    'no-eval': warn,
    'no-ex-assign': warn,
    'no-extend-native': warn,
    'no-extra-bind': warn,
    'no-extra-boolean-cast': warn,
    'no-extra-label': warn,
    'no-extra-parens': [off, 'all', { nestedBinaryExpressions: false }],
    'no-extra-semi': warn,
    'no-fallthrough': warn,
    'no-floating-decimal': warn,
    'no-func-assign': warn,
    'no-global-assign': warn,
    'no-implicit-coercion': warn,
    'no-implicit-globals': warn,
    'no-implied-eval': warn,
    'no-inline-comments': off,
    'no-inner-declarations': [warn, 'functions'],
    'no-invalid-regexp': warn,
    'no-invalid-this': off,
    'no-irregular-whitespace': warn,
    'no-iterator': warn,
    'no-label-var': warn,
    'no-labels': [warn, { allowLoop: false, allowSwitch: false }],
    'no-lone-blocks': warn,
    'no-lonely-if': warn,
    'no-loop-func': warn,
    'no-loss-of-precision': warn,
    'no-magic-numbers': [off, { ignore: [-1, 0, 1, 2, 3] }],
    'no-misleading-character-class': warn,
    'no-mixed-operators': [warn, {
      allowSamePrecedence: true,
      groups: [
        ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
        ['&&', '||'],
        ['in', 'instanceof']
      ]
    }],
    'no-mixed-requires': warn,
    'no-mixed-spaces-and-tabs': warn,
    'no-multi-assign': warn,
    'no-multi-spaces': warn,
    'no-multi-str': warn,
    'no-multiple-empty-lines': [warn, { max: 1, maxEOF: 0 }],
    'no-negated-condition': warn,
    'no-negated-in-lhs': warn,
    'no-nested-ternary': warn,
    'no-new': warn,
    'no-new-func': warn,
    'no-new-object': warn,
    'no-new-require': warn,
    'no-new-symbol': warn,
    'no-new-wrappers': warn,
    'no-obj-calls': warn,
    'no-octal': warn,
    'no-octal-escape': warn,
    'no-param-reassign': off,
    'no-path-concat': warn,
    'no-plusplus': off,
    'no-process-env': off,
    'no-process-exit': error,
    'no-proto': warn,
    'no-prototype-builtins': warn,
    'no-redeclare': [warn, { builtinGlobals: false }],
    'no-regex-spaces': warn,
    'no-restricted-globals': warn,
    'no-restricted-imports': warn,
    'no-restricted-modules': warn,
    'no-restricted-properties': warn,
    'no-restricted-syntax': [warn, 'WithStatement'],
    'no-return-assign': [warn, 'except-parens'],
    'no-return-await': warn,
    'no-script-url': warn,
    'no-self-assign': [warn, { props: true }],
    'no-self-compare': warn,
    'no-sequences': warn,
    'no-shadow': warn,
    'no-shadow-restricted-names': warn,
    'no-sparse-arrays': warn,
    'no-sync': off,
    'no-tabs': warn,
    'no-template-curly-in-string': warn,
    'no-ternary': off,
    'no-this-before-super': warn,
    'no-throw-literal': warn,
    'no-trailing-spaces': warn,
    'no-undef': error,
    'no-undef-init': warn,
    'no-undefined': off,
    'no-underscore-dangle': off,
    'no-unexpected-multiline': warn,
    'no-unmodified-loop-condition': warn,
    'no-unneeded-ternary': [warn, { defaultAssignment: false }],
    'no-unreachable': warn,
    'no-unsafe-finally': warn,
    'no-unsafe-negation': warn,
    'no-unused-expressions': [warn, {
      allowShortCircuit: true,
      allowTaggedTemplates: true,
      allowTernary: true
    }],
    'no-unused-labels': warn,
    'no-unused-vars': [warn, { vars: 'all' }],
    'no-use-before-define': [error, {
      classes: false,
      functions: false,
      variables: false
    }],
    'no-useless-call': warn,
    'no-useless-catch': warn,
    'no-useless-computed-key': warn,
    'no-useless-concat': warn,
    'no-useless-constructor': warn,
    'no-useless-escape': warn,
    'no-useless-rename': warn,
    'no-useless-return': warn,
    'no-var': warn,
    'no-void': warn,
    'no-warning-comments': warn,
    'no-whitespace-before-property': warn,
    'no-with': warn,
    'nonblock-statement-body-position': warn,
    'object-curly-newline': [warn, { consistent: true, multiline: true }],
    'object-curly-spacing': [warn, 'always'],
    'object-property-newline': [warn, {
      allowMultiplePropertiesPerLine: true
    }],
    'object-shorthand': [warn, 'always'],
    'one-var': [warn, 'never'],
    'one-var-declaration-per-line': warn,
    'operator-assignment': [warn, 'always'],
    'operator-linebreak': [warn, 'after', {
      overrides: {
        ':': 'before',
        '?': 'before',
        '??': 'before'
      }
    }],
    'padded-blocks': [warn, {
      blocks: 'never',
      classes: 'never',
      switches: 'never'
    }],
    'padding-line-between-statements': warn,
    'prefer-arrow-callback': warn,
    'prefer-const': [warn, { destructuring: 'all' }],
    'prefer-destructuring': [off, { array: false, object: true }],
    'prefer-named-capture-group': off,
    'prefer-numeric-literals': warn,
    'prefer-object-spread': warn,
    'prefer-promise-reject-errors': warn,
    'prefer-regex-literals': warn,
    'prefer-rest-params': warn,
    'prefer-spread': warn,
    'prefer-template': off,
    'quote-props': [warn, 'as-needed'],
    quotes: [warn, 'single', {
      allowTemplateLiterals: false,
      avoidEscape: true
    }],
    radix: warn,
    'require-atomic-updates': warn,
    'require-await': warn,
    'require-unicode-regexp': off,
    'require-yield': warn,
    'rest-spread-spacing': [warn, 'never'],
    semi: [warn, 'always'],
    'semi-spacing': [warn, { after: true, before: false }],
    'semi-style': [warn, 'last'],
    'sort-imports': [off, {
      ignoreCase: false,
      ignoreDeclarationSort: false,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple']
    }],
    'sort-keys': [warn, 'asc', { natural: true }],
    'sort-vars': warn,
    'space-before-blocks': [warn, 'always'],
    'space-before-function-paren': [warn, 'never'],
    'space-in-parens': [warn, 'never'],
    'space-infix-ops': warn,
    'space-unary-ops': [warn, { nonwords: false, words: true }],
    'spaced-comment': [warn, 'always', {
      block: {
        balanced: true,
        exceptions: ['*'],
        markers: ['*package', '!', ',', ':', '::', 'flow-include']
      },
      line: { markers: ['*package', '!', '/', ',', '='] }
    }],
    strict: [warn, 'never'],
    'switch-colon-spacing': [warn, {
      after: true,
      before: false
    }],
    'symbol-description': warn,
    'template-curly-spacing': [warn, 'never'],
    'template-tag-spacing': [warn, 'never'],
    'unicode-bom': [warn, 'never'],
    'use-isnan': warn,
    'valid-typeof': [warn, { requireStringLiterals: true }],
    'vars-on-top': warn,
    'wrap-iife': [warn, 'any', { functionPrototypeMethods: true }],
    'wrap-regex': off,
    'yield-star-spacing': [warn, 'both'],
    yoda: [warn, 'never']
  },
  settings: {
    'import/extensions': [
      '.js',
      '.ts'
    ],
    'import/internal-regex': '^@',
    jsdoc: {
      mode: 'closure'
    }
  }
};
