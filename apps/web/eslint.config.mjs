import { createConfigForNuxt } from '@nuxt/eslint-config/flat';
import baseConfig from '../../eslint.config.mjs';

export default createConfigForNuxt({
  features: {
    typescript: true,
  },
})
  .prepend(...baseConfig)
  .append(
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
        // Formatting is owned by Prettier.
        'vue/html-self-closing': 'off',
      },
    },
    {
      ignores: [
        '.nuxt/**',
        '.output/**',
        'node_modules',
        '**/*.d.ts',
        '**/*.vue.js',
      ],
    },
  );
