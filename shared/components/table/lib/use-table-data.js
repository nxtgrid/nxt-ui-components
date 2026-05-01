import { readonly, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { createSupabaseRestClient } from './providers/supabase-rest';
import { createRawDataClient } from './providers/raw-data';

export const useTableData = (provider, options, variables) => {
  const $toast = useToast();
  const _loading = ref(false);
  const _entries = ref(null);
  const _hasError = ref(false);
  const _totalRecords = ref(0);

  let dataProvider;

  if(provider === 'supabase-rest')
    dataProvider = createSupabaseRestClient(options);
  if(provider === 'raw-data')
    dataProvider = createRawDataClient(options);

  const fetchData = vars => {
    _loading.value = true;

    dataProvider
      .fetch(vars)
      .then(res => {
        _hasError.value = false;
        _entries.value = res.entries;
        _totalRecords.value = res.totalRecords;
      })
      .catch(err => {
        const title = 'Error making table query';
        console.error(title, err);
        $toast.error(`${ title }: ${ err.message }`);
        _hasError.value = true;
      })
      .finally(() => { _loading.value = false; })
    ;
  };

  const downloadData = downloadSettings => {
    _loading.value = true;
    return dataProvider
      .fetch(variables.value, { isDownload: true, downloadSettings })
      .finally(() => { _loading.value = false; })
    ;
  };

  watch(variables, fetchData, { immediate: true });

  return {
    loading: readonly(_loading),
    entries: readonly(_entries),
    hasError: readonly(_hasError),
    totalRecords: readonly(_totalRecords),
    download: downloadData,
    reload: () => fetchData(variables.value),
    // We make it very hard and explicit to update entries from the outside
    updateEntries: newEntries => { _entries.value = newEntries; },
  };
};
