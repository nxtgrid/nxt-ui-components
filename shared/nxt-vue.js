import VWave from 'v-wave';
import Toast, { POSITION } from 'vue-toastification';
import { defineStore } from 'pinia';
import { MdiIcon, NxtButton } from './components';
import { tableCellMap } from './components/table/cells';
import { DEFAULT_TIMEZONE } from './libraries/constants';

import 'vue-toastification/dist/index.css';

export const nxtVue = {
  install(app, options = {}) {

    // Global helper function to remove all Vue Proxy stuff when logging
    window.log = toLog => console.info(JSON.parse(JSON.stringify(toLog)));

    app
      .use(Toast, {
        position: POSITION.BOTTOM_RIGHT,
        transition: 'Vue-Toastification__fade',
        timeout: 3000,
      })
      .use(VWave, { finalOpacity: 0 })
      .provide('mdiIcons', options.mdiIcons ?? {})
      .provide('tableCellMap', { ...tableCellMap, ...options.tableCellMap })
      .component('MdiIcon', MdiIcon)
      .component('NxtButton', NxtButton)
    ;
  },
};

export const useGlobalStore = defineStore('nxt-vue-global', {
  state: () => ({
    _timezone: undefined,
  }),

  getters: {
    timezone: state => state._timezone,
  },

  actions: {
    setTimezone(timezone) {
      this._timezone = timezone ?? DEFAULT_TIMEZONE;
      console.info('TIMEZONE SET TO:', this._timezone);
    },
  },
});
