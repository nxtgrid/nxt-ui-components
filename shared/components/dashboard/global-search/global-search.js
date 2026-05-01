import { defineStore } from 'pinia';

export const useGlobalSearchStore = defineStore('global-search', {
  state: () => ({
    _searchValue: '',
    _activeTab: null,
    _queryParams: {
      search: '',
      limit: 25,
      offset: 0,
    },
    _result: null,
    _loading: false,
  }),

  getters: {
    searchValue: state => state._searchValue,
    activeTab: state => state._activeTab,
    result: state => state._result,
    queryParams: state => state._queryParams,
    loading: state => state._loading,
  },

  actions: {
    setSearchValue(value) {
      this._searchValue = value;
    },

    setActiveTab(tab) {
      this._activeTab = tab;
      this._queryParams.offset = 0;
    },

    setQueryParams(params) {
      this._queryParams = {
        ...this._queryParams,
        ...params,
      };
    },

    setResult(result) {
      this._result = result;
    },

    setLoading(bool) {
      this._loading = bool;
    },
  },
});
