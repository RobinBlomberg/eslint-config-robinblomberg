module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  ignorePatterns: [
    '**/dist/**/*.js'
  ],
  overrides: [
    {
      files: [
        '**/test/**',
        '**/tests/**'
      ],
      rules: {
        'no-magic-numbers': 'off'
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
  root: true,
  rules: {
    'accessor-pairs': 'warn',
    'array-bracket-newline': 'off',
    'array-bracket-spacing': ['warn', 'never'],
    'array-callback-return': 'warn',
    'array-element-newline': ['warn', 'consistent'],
    'arrow-body-style': 'off',
    'arrow-parens': ['warn', 'always'],
    'arrow-spacing': ['warn', { after: true, before: true }],
    'block-scoped-var': 'warn',
    'block-spacing': ['warn', 'always'],
    'brace-style': ['warn', '1tbs'],
    'callback-return': ['warn', ['callback', 'cb', 'next']],
    camelcase: ['off', { properties: 'never' }],
    'capitalized-comments': 'off',
    'class-methods-use-this': 'warn',
    'comma-dangle': ['warn', 'never'],
    'comma-spacing': ['warn', { after: true, before: false }],
    'comma-style': ['warn', 'last'],
    complexity: 'off',
    'computed-property-spacing': ['warn', 'never'],
    'consistent-return': 'warn',
    'consistent-this': 'warn',
    'constructor-super': 'warn',
    curly: ['warn', 'all'],
    'default-case': 'warn',
    'dot-location': ['warn', 'property'],
    'dot-notation': ['warn', { allowKeywords: true }],
    'eol-last': 'warn',
    eqeqeq: ['warn', 'always', { null: 'ignore' }],
    'for-direction': 'warn',
    'func-call-spacing': ['warn', 'never'],
    'func-name-matching': 'warn',
    'func-names': ['warn', 'as-needed'],
    'func-style': ['warn', 'expression'],
    'function-call-argument-newline': 'off',
    'function-paren-newline': 'off',
    'generator-star-spacing': ['warn', { after: true, before: true }],
    'getter-return': 'warn',
    'global-require': 'off',
    'guard-for-in': 'warn',
    'handle-callback-err': ['warn', '^(err|error)$'],
    'id-blacklist': 'warn',
    'id-length': 'off',
    'id-match': ['warn', '^_?[_A-Za-z][A-Za-z0-9_]*$'],
    'implicit-arrow-linebreak': ['off', 'beside'],
    'init-declarations': 'warn',
    'jsx-quotes': 'warn',
    'key-spacing': ['warn', { afterColon: true, beforeColon: false }],
    'keyword-spacing': ['warn', { after: true, before: true }],
    'line-comment-position': 'off',
    'linebreak-style': 'off',
    'lines-around-comment': 'off',
    'lines-between-class-members': 'warn',
    'max-classes-per-file': ['warn', 1],
    'max-depth': 'off',
    'max-len': ['warn', { code: 100 }],
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    'max-nested-callbacks': 'warn',
    'max-params': 'off',
    'max-statements': 'off',
    'max-statements-per-line': ['warn', { max: 1 }],
    'multiline-comment-style': 'off',
    'multiline-ternary': 'off',
    'new-cap': ['warn', { capIsNew: false, newIsCap: true, properties: true }],
    'new-parens': 'warn',
    'newline-per-chained-call': 'off',
    'no-alert': 'off',
    'no-array-constructor': 'warn',
    'no-async-promise-executor': 'warn',
    'no-await-in-loop': 'warn',
    'no-bitwise': 'warn',
    'no-buffer-constructor': 'warn',
    'no-caller': 'warn',
    'no-case-declarations': 'warn',
    'no-class-assign': 'warn',
    'no-compare-neg-zero': 'warn',
    'no-cond-assign': 'warn',
    'no-confusing-arrow': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-const-assign': 'warn',
    'no-constant-condition': ['warn', { checkLoops: false }],
    'no-continue': 'warn',
    'no-control-regex': 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'warn',
    'no-delete-var': 'warn',
    'no-div-regex': 'warn',
    'no-dupe-args': 'warn',
    'no-dupe-class-members': 'warn',
    'no-dupe-keys': 'warn',
    'no-duplicate-case': 'warn',
    'no-duplicate-imports': 'warn',
    'no-else-return': 'warn',
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'no-empty-character-class': 'warn',
    'no-empty-function': 'warn',
    'no-empty-pattern': 'warn',
    'no-eq-null': 'off',
    'no-eval': 'warn',
    'no-ex-assign': 'warn',
    'no-extend-native': 'warn',
    'no-extra-bind': 'warn',
    'no-extra-boolean-cast': 'warn',
    'no-extra-label': 'warn',
    'no-extra-parens': ['warn', 'functions'],
    'no-extra-semi': 'warn',
    'no-fallthrough': 'warn',
    'no-floating-decimal': 'warn',
    'no-func-assign': 'warn',
    'no-global-assign': 'warn',
    'no-implicit-coercion': 'warn',
    'no-implicit-globals': 'warn',
    'no-implied-eval': 'warn',
    'no-inline-comments': 'off',
    'no-inner-declarations': ['warn', 'functions'],
    'no-invalid-regexp': 'warn',
    'no-invalid-this': 'off',
    'no-irregular-whitespace': 'warn',
    'no-iterator': 'warn',
    'no-label-var': 'warn',
    'no-labels': ['warn', { allowLoop: false, allowSwitch: false }],
    'no-lone-blocks': 'warn',
    'no-lonely-if': 'warn',
    'no-loop-func': 'warn',
    'no-magic-numbers': ['warn', {
      ignore: [-1, 0, 1, 2]
    }],
    'no-misleading-character-class': 'warn',
    'no-mixed-operators': ['warn', {
      allowSamePrecedence: true,
      groups: [
        ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
        ['&&', '||'],
        ['in', 'instanceof']
      ]
    }],
    'no-mixed-requires': 'warn',
    'no-mixed-spaces-and-tabs': 'warn',
    'no-multi-assign': 'warn',
    'no-multi-spaces': 'warn',
    'no-multi-str': 'warn',
    'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0 }],
    'no-negated-condition': 'warn',
    'no-negated-in-lhs': 'warn',
    'no-nested-ternary': 'warn',
    'no-new': 'warn',
    'no-new-func': 'warn',
    'no-new-object': 'warn',
    'no-new-require': 'warn',
    'no-new-symbol': 'warn',
    'no-new-wrappers': 'warn',
    'no-obj-calls': 'warn',
    'no-octal': 'warn',
    'no-octal-escape': 'warn',
    'no-param-reassign': 'off',
    'no-path-concat': 'warn',
    'no-plusplus': 'off',
    'no-process-env': 'off',
    'no-process-exit': 'error',
    'no-proto': 'warn',
    'no-prototype-builtins': 'warn',
    'no-redeclare': ['warn', { builtinGlobals: false }],
    'no-regex-spaces': 'warn',
    'no-restricted-globals': 'warn',
    'no-restricted-imports': 'warn',
    'no-restricted-modules': 'warn',
    'no-restricted-properties': 'warn',
    'no-restricted-syntax': ['warn',
      'BinaryExpression[operator="in"]',
      'FunctionDeclaration',
      'LabeledStatement',
      'WithStatement'
    ],
    'no-return-assign': ['warn', 'except-parens'],
    'no-return-await': 'warn',
    'no-script-url': 'warn',
    'no-self-assign': ['warn', { props: true }],
    'no-self-compare': 'warn',
    'no-sequences': 'warn',
    'no-shadow': 'warn',
    'no-shadow-restricted-names': 'warn',
    'no-sparse-arrays': 'warn',
    'no-sync': 'warn',
    'no-tabs': 'warn',
    'no-template-curly-in-string': 'warn',
    'no-ternary': 'off',
    'no-this-before-super': 'warn',
    'no-throw-literal': 'warn',
    'no-trailing-spaces': 'warn',
    'no-undef': 'error',
    'no-undef-init': 'warn',
    'no-undefined': 'off',
    'no-underscore-dangle': 'off',
    'no-unexpected-multiline': 'warn',
    'no-unmodified-loop-condition': 'warn',
    'no-unneeded-ternary': ['warn', { defaultAssignment: false }],
    'no-unreachable': 'warn',
    'no-unsafe-finally': 'warn',
    'no-unsafe-negation': 'warn',
    'no-unused-expressions': ['warn', {
      allowShortCircuit: true,
      allowTaggedTemplates: true,
      allowTernary: true
    }],
    'no-unused-labels': 'warn',
    'no-unused-vars': ['warn', { vars: 'all' }],
    'no-use-before-define': ['error', {
      classes: false,
      functions: false,
      variables: false
    }],
    'no-useless-call': 'warn',
    'no-useless-catch': 'warn',
    'no-useless-computed-key': 'warn',
    'no-useless-concat': 'warn',
    'no-useless-constructor': 'warn',
    'no-useless-escape': 'warn',
    'no-useless-rename': 'warn',
    'no-useless-return': 'warn',
    'no-var': 'warn',
    'no-void': 'warn',
    'no-warning-comments': 'warn',
    'no-whitespace-before-property': 'warn',
    'no-with': 'warn',
    'nonblock-statement-body-position': 'warn',
    'object-curly-newline': ['warn', { consistent: true, multiline: true }],
    'object-curly-spacing': ['warn', 'always'],
    'object-property-newline': ['warn', {
      allowMultiplePropertiesPerLine: true
    }],
    'object-shorthand': ['warn', 'always'],
    'one-var': ['warn', 'never'],
    'one-var-declaration-per-line': 'warn',
    'operator-assignment': ['warn', 'always'],
    'operator-linebreak': ['warn'],
    'padded-blocks': ['warn', {
      blocks: 'never',
      classes: 'never',
      switches: 'never'
    }],
    'padding-line-between-statements': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-const': ['warn', { destructuring: 'all' }],
    'prefer-destructuring': ['warn', { array: false, object: true }],
    'prefer-named-capture-group': 'off',
    'prefer-numeric-literals': 'warn',
    'prefer-object-spread': 'warn',
    'prefer-promise-reject-errors': 'warn',
    'prefer-regex-literals': 'warn',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',
    'prefer-template': 'warn',
    'quote-props': ['warn', 'as-needed'],
    quotes: ['warn', 'single', {
      allowTemplateLiterals: false,
      avoidEscape: true
    }],
    radix: 'warn',
    'require-atomic-updates': 'warn',
    'require-await': 'warn',
    'require-unicode-regexp': 'off',
    'require-yield': 'warn',
    'rest-spread-spacing': ['warn', 'never'],
    semi: ['warn', 'never'],
    'semi-spacing': ['warn', { after: true, before: false }],
    'semi-style': ['warn', 'first'],
    'sort-imports': ['warn', {
      ignoreCase: false,
      ignoreDeclarationSort: false,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple']
    }],
    'sort-keys': ['warn', 'asc', { natural: true }],
    'sort-vars': 'warn',
    'space-before-blocks': ['warn', 'always'],
    'space-before-function-paren': ['warn', 'never'],
    'space-in-parens': ['warn', 'never'],
    'space-infix-ops': 'warn',
    'space-unary-ops': ['warn', { nonwords: false, words: true }],
    'spaced-comment': ['warn', 'always', {
      block: {
        balanced: true,
        exceptions: ['*'],
        markers: ['*package', '!', ',', ':', '::', 'flow-include']
      },
      line: { markers: ['*package', '!', '/', ',', '='] }
    }],
    strict: ['warn', 'never'],
    'switch-colon-spacing': ['warn', {
      after: true,
      before: false
    }],
    'symbol-description': 'warn',
    'template-curly-spacing': ['warn', 'never'],
    'template-tag-spacing': ['warn', 'never'],
    'unicode-bom': ['warn', 'never'],
    'use-isnan': 'warn',
    'valid-typeof': ['warn', { requireStringLiterals: true }],
    'vars-on-top': 'warn',
    'wrap-iife': ['warn', 'any', { functionPrototypeMethods: true }],
    'wrap-regex': 'warn',
    'yield-star-spacing': ['warn', 'both'],
    yoda: ['warn', 'never']
  }
}
