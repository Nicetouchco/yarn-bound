module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest'
  },
  clearMocks: true,
  transformIgnorePatterns: [
    '/node_modules/(?!@mnbroatch).+\\.(js|jsx|ts|tsx)$'
  ],
  // If you're using TypeScript, you'll also want to add a testMatch or testRegex to pick up .ts/.tsx files
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'], // or testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'] // add ts and tsx extensions
}
