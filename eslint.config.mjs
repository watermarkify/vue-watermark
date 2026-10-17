import antfu from '@antfu/eslint-config'

export default antfu({
  // Prettier owns formatting; avoid conflicting ESLint style fixes.
  stylistic: false,
  ignores: ['dist/**', 'docs/**'],
})
