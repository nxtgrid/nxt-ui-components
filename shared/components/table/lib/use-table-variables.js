import { readonly, ref } from 'vue';
import { useTableSearchParams } from './use-table-search-params';
import { useTablePreferencesStore } from '..';

export const useTableVariables = initialVariables => {
  const tableSearchParams = useTableSearchParams();
  const variablesFromUrlSearchParams = tableSearchParams.get();

  const _allVariables = ref({
    limit: useTablePreferencesStore().numRows,
    offset: 0,
    sort: null,
    order: null,
    search: '',
    filters: {},
    ...initialVariables,
    ...variablesFromUrlSearchParams,
  });

  const _updateVariables = newVariables => {
    _allVariables.value = { ..._allVariables.value, ...newVariables };
    tableSearchParams.update(_allVariables.value);
  };

  return {
    variables: readonly(_allVariables),
    doUpdateVariables: _updateVariables,
  };
};
