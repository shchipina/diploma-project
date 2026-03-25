/**
 * Commitlint configuration
 * Format: <type>(<scope>): <subject> [TASK-ID]
 *
 * Examples:
 * - feat(auth): add JWT authentication [OPENDATA-507]
 * - fix(api): resolve CORS issue [OPENDATA-508]
 * - docs: update README with setup instructions
 */

export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',     // New feature
                'fix',      // Bug fix
                'docs',     // Documentation changes
                'style',    // Code style changes (formatting, etc.)
                'refactor', // Code refactoring
                'perf',     // Performance improvements
                'test',     // Adding or updating tests
                'build',    // Build system or dependencies
                'ci',       // CI/CD changes
                'chore',    // Other changes (maintenance)
                'revert',   // Revert previous commit
            ],
        ],
        'subject-case': [2, 'never', ['upper-case', 'pascal-case']],
        'subject-empty': [2, 'never'],
        'type-empty': [2, 'never'],
        'header-max-length': [2, 'always', 100],
        'scope-case': [2, 'always', 'lower-case'],
        'body-leading-blank': [1, 'always'],
        'footer-leading-blank': [1, 'always'],
    },
};
