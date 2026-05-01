import { defineStore } from 'pinia';
import { useTitle } from '@vueuse/core';

const titleTemplate = `%s | ${ window.BRAND?.name ?? 'NXT Grid' }`;
const _pageTitle = useTitle('Dashboard', { titleTemplate });

export const useDashboardUiStore = defineStore('dashboard-ui', {
  state: () => ({
    _menuActive: false,
    _sidebarMinimized: false,
    _breadCrumbs: null,
  }),

  getters: {
    menuActive: state => state._menuActive,
    sideBarMinimized: state => state._sidebarMinimized,
    breadCrumbs: state => state._breadCrumbs,
  },

  actions: {
    toggleMenu() {
      this._menuActive = !this._menuActive;
    },

    closeMenu() {
      this._menuActive = false;
    },

    toggleSidebarSize() {
      this._sidebarMinimized = !this._sidebarMinimized;
    },

    setBreadCrumbs(crumbs) {
      this._breadCrumbs = crumbs;
    },

    addBreadCrumbs(crumbs) {
      crumbs.forEach(({ refreshKey }) => {
        if(!refreshKey) return;
        this._breadCrumbs = this._breadCrumbs
          .filter(crumb => crumb.refreshKey !== refreshKey);
      });
      this._breadCrumbs = [ ...this._breadCrumbs, ...crumbs ];
    },

    setPageTitle(newTitle) {
      _pageTitle.value = newTitle;
    },
  },
});
