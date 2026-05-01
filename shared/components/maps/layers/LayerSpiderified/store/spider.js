import { defineStore } from 'pinia';

const BIG_ZOOM_THRESHOLD = 18.5;

export const useSpiderStore = defineStore('spider', {
  state: () => ({
    _activeClusterId: undefined,
    _hasBigZoom: false,
  }),

  getters: {
    activeClusterId: state => state._activeClusterId,
    hasBigZoom: state => state._hasBigZoom,
  },

  actions: {
    setActiveCluster(id) {
      this._activeClusterId = id;
    },
    setHasBigZoom(zoomLevel) {
      this._hasBigZoom = zoomLevel > BIG_ZOOM_THRESHOLD;
    },
  },
});
