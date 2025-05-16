console.log('Loading ESLint config...');
export default [
    {
        ignores: [
            '**/node_modules/', // Ignore any node_modules in any subdirectory
            'node_modules/', // Ignore node_modules in the root directory
            '.unlighthouse/', // Ignore .unlighthouse folder in the root directory
            '**/.unlighthouse/**', // Ignore any `unlighthouse` folder in subdirectories
            '.husky/', // Ignore .husky folder in the root directory
        ],
        rules: {
            eqeqeq: 'off',
            'no-unused-vars': 'warn',
            'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
        },
    },
];
