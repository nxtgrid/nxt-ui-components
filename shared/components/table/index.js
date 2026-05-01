import { prop, compose, flip, append, uniq, sort, ascend, identity, map } from 'ramda';
import { defineStore } from 'pinia';

// We can add label-value objects when primevue is phased out
const DEFAULT_NUM_ROWS_VALUES = [ 25, 50, 100 ];

export const useTablePreferencesStore = defineStore('table-preferences', {
  state: () => ({
    _numRows: 25,
  }),

  getters: {
    numRows: state => state._numRows,
    numRowsOptions: compose(
      append({ label: 'Max (10K)', value: 10000 }),
      map(value => ({ label: `${ value }`, value })),
      sort(ascend(identity)),
      uniq,
      flip(append)(DEFAULT_NUM_ROWS_VALUES),
      prop('_numRows'),
    ),
  },

  actions: {
    setNumRows(numRows) {
      this._numRows = numRows;
    },
  },

  persist: true,
});
