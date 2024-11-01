module.exports = {
  plugins: ['prettier'],
  extends: ['next', 'next/core-web-vitals'], // Combine the items in a single array
  rules: {
    'no-console': 'off',
    'prettier/prettier': 'warn',
    'react-hooks/exhaustive-deps': 'off',
  },
  ignorePatterns: ['./src/components/theme/*'], // Correct property name is "ignorePatterns", not "ignores"
};
