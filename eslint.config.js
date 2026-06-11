import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
  js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    // Parse TypeScript inside .astro frontmatter / <script> blocks.
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  {
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        // browser globals used by the V2 behaviour script (public/scripts/meridian.js)
        IntersectionObserver: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
];
