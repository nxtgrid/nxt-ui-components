import { defineConfig } from 'eslint/config';
import storybook from 'eslint-plugin-storybook';
import sharedConfig from './shared/nxt-eslint-config.js';

export default defineConfig([
  ...sharedConfig,
  ...storybook.configs['flat/recommended'],
]);
