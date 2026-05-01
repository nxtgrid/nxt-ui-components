/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  'stories': [
    '../shared/_stories/**/*.mdx',
    '../shared/_stories/**/*.stories.js',
  ],
  'addons': [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  'framework': {
    'name': '@storybook/vue3-vite',
    'options': {},
  },
  docs: {
    autodocs: 'tag',
  },
};
export default config;
