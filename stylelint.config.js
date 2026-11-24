const colorFunctions = [
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'color',
]

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  rules: {
    'color-no-hex': [
      true,
      { message: '色は tokens.css の CSS 変数を使う（直接の16進カラーは禁止）' },
    ],
    'color-named': ['never', { message: '色は tokens.css の CSS 変数を使う（名前付き色は禁止）' }],
    'function-disallowed-list': [
      colorFunctions,
      { message: '色は tokens.css の CSS 変数を使う（色関数は禁止）' },
    ],
    'selector-class-pattern': null,
  },
  overrides: [
    {
      files: ['src/shared/styles/tokens.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'function-disallowed-list': null,
        'color-hex-length': null,
        'alpha-value-notation': null,
        'color-function-notation': null,
        'color-function-alias-notation': null,
        'number-max-precision': null,
        'comment-empty-line-before': null,
        'value-keyword-case': null,
        'declaration-empty-line-before': null,
        'custom-property-empty-line-before': null,
      },
    },
  ],
}
