import VWave from 'v-wave';
import { setup } from '@storybook/vue3-vite';

import NxtButton from '../components/NxtButton/NxtButton.vue';
import MdiIcon from '../components/MdiIcon/MdiIcon.vue';

setup(async app => {
  // @HACK :: Plugin tracks its own installation, and will only install once,
  // while a new app is created for every story. Luckily we can manually reach
  // into the plugin the reset the `installed` boolean 🍀
  VWave.installed = false;
  app
    .use(VWave, { finalOpacity: 0 })
    .component('MdiIcon', MdiIcon)
  ;
});

export default {
  title: 'Containment/Nxt Button',
  component: NxtButton,
  // tags: [ 'autodocs' ],
  argTypes: {
    size: {
      control: 'select',
      options: [ 'default', 'small' ],
    },
    variant: {
      control: 'select',
      options: [ 'primary', 'secondary' ],
    },
    to: {
      control: false,
    },
    iconName: {
      control: false,
    },
    iconOnly: {
      control: false,
    },
    disabled: {
      control: 'boolean',
    },
    // Slots
    default: {
      control: 'text',
    },
  },
};

export const Regular = {
  args: {
    size: 'default',
    variant: 'primary',
    disabled: false,
    default: 'Nxt Button',
  },
};

export const IconOnly = {
  name: 'Icon only',
  args: {
    iconOnly: true,
    iconName: 'mdiCloudRefreshOutline',
    variant: 'secondary',
    disabled: false,
  },
};
