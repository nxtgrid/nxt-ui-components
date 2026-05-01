<template>
<form @submit.prevent="doGenerate">
  <period-picker
    v-model:from="params.from"
    v-model:to="params.to"
    max="today"
    on-single-row
  />
  <nxt-modal-save-cancel-footer :is-disabled="isGenerating" save-button-text="Download" />
</form>
</template>

<script>
import { ref, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import { useNxtModal } from '@nxt/components/NxtModal';
import { useGlobalStore } from '@nxt/nxt-vue';

import PeriodPicker from '@nxt/components/PeriodPicker/PeriodPicker.vue';
import { periodToIsoStrings } from '@nxt/libraries/period-formatters';
import { NxtModalSaveCancelFooter } from '@nxt/components';

export default {
  setup() {
    const modal = useNxtModal();
    const toast = useToast();

    const { downloadFn } = modal.data;
    const timezone = useGlobalStore().timezone;

    const isGenerating = ref(false);
    const params = reactive({
      from: undefined,
      to: undefined,
    });

    const doGenerate = () => {
      const { from, to } = periodToIsoStrings(timezone)(params);
      isGenerating.value = true;

      downloadFn({ filters: [
        { method: 'gte', column: 'updated_at', value: from },
        { method: 'lt', column: 'updated_at', value: to },
      ] })
        .then(modal.done)
        .catch(err => {
          const title = 'Error generating downloadable file';
          console.error(title, err);
          toast.error(`${ title }: ${ err.message }`);
        })
        .finally(() => {
          isGenerating.value = false;
        })
      ;
    };

    return {
      isGenerating,
      params,
      doGenerate,
    };
  },

  components: { PeriodPicker, NxtModalSaveCancelFooter },
};
</script>
