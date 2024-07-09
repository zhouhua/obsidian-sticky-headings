import stylistic from '@stylistic/eslint-plugin';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    stylistic.configs['recommended-flat'],
  ],
  plugins: {
    '@stylistic': stylistic,
  },
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
},
{
  ignores: [
    'main.js',
    'typings/**',
  ],
},
{

  rules: {
    'no-unused-vars': 'off',
    'no-dupe-class-members': 'off',
    'no-loop-func': 'off',
    'no-shadow': 'off',
    'no-unused-expressions': 'off',
    'no-use-before-define': 'off',
    'no-throw-literal': 'off',
    'prefer-destructuring': 'off',

    '@stylistic/ban-ts-comment': 'off',
    '@stylistic/no-prototype-builtins': 'off',
    '@stylistic/no-empty-function': 'off',
    '@stylistic/semi': ['error', 'always'],
    '@stylistic/arrow-parens': ['error', 'as-needed'],
    '@stylistic/array-bracket-newline': 'error',
    '@stylistic/array-element-newline': ['error', 'consistent'],
    '@stylistic/function-call-argument-newline': ['error', 'consistent'],
    '@stylistic/function-call-spacing': ['error', 'never'],
    '@stylistic/generator-star-spacing': ['error', 'before'],
    '@stylistic/max-len': [
      'error', {
        code: 120,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreTrailingComments: true,
      },
    ],
    '@stylistic/linebreak-style': ['error', 'unix'],
    '@stylistic/no-confusing-arrow': 'error',
    '@stylistic/no-extra-semi': 'error',
    '@stylistic/object-curly-newline': [
      'error', {
        multiline: true,
        consistent: true,
      },
    ],
    '@stylistic/one-var-declaration-per-line': ['error', 'always'],
    '@stylistic/semi-style': ['error', 'last'],
    '@stylistic/switch-colon-spacing': ['error', { after: true, before: false }],
    '@stylistic/jsx-pascal-case': [
      'error', {
        allowAllCaps: false,
        allowLeadingUnderscore: false,
        allowNamespace: true,
      },
    ],
    '@stylistic/jsx-props-no-multi-spaces': 'error',
    '@stylistic/jsx-self-closing-comp': [
      'error', {
        component: true,
        html: false,
      },
    ],
    '@stylistic/jsx-sort-props': [
      'error', {
        callbacksLast: true,
        shorthandFirst: true,
        multiline: 'first',
        noSortAlphabetically: true,
        reservedFirst: true,
      },
    ],
    '@stylistic/member-delimiter-style': [
      'error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        multilineDetection: 'brackets',
        singleline: {
          delimiter: 'semi',
          requireLast: true,
        },
      },
    ],
    '@typescript-eslint/no-floating-promises': 'off',
    '@stylistic/object-property-newline': [
      'error', {
        allowAllPropertiesOnSameLine: true,
      },
    ],

    '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/consistent-indexed-object-style': 'error',
    '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
    '@typescript-eslint/consistent-type-definitions': 'error',
    '@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: false }],
    '@typescript-eslint/consistent-type-imports': [
      'error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
        disallowTypeAnnotations: true,
      },
    ],
    '@typescript-eslint/member-ordering': ['warn'],
    '@typescript-eslint/no-array-delete': 'error',
    '@typescript-eslint/no-confusing-non-null-assertion': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/no-dupe-class-members': 'error',
    '@typescript-eslint/no-dynamic-delete': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-empty-object-type': 'error',
    '@typescript-eslint/no-invalid-void-type': 'error',
    '@typescript-eslint/no-loop-func': 'error',
    '@typescript-eslint/no-meaningless-void-operator': 'error',
    '@typescript-eslint/no-mixed-enums': 'error',
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-shadow': [
      'error',
      {
        builtinGlobals: false,
        hoist: 'all',
        allow: [],
        ignoreTypeValueShadow: false,
        ignoreFunctionTypeParameterNameValueShadow: false,
      },
    ],
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-unnecessary-template-expression': 'error',
    '@typescript-eslint/no-unused-expressions': [
      'error', {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    '@typescript-eslint/no-use-before-define': 'error',
    '@typescript-eslint/no-useless-empty-export': 'error',
    '@typescript-eslint/only-throw-error': 'error',
    '@typescript-eslint/prefer-destructuring': 'error',
    '@typescript-eslint/prefer-enum-initializers': 'error',
    '@typescript-eslint/prefer-find': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/unified-signatures': 'error',
  },
});
