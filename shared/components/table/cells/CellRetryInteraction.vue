<template>
<nxt-button
  v-if="showMe"
  title="Retry"
  variant="primary"
  size="small"
  :icon-svg="mdiReload"
  icon-only
  @click.stop="doRetry"
/>
</template>

<script>
import { computed } from 'vue';
import { mdiReload } from '@mdi/js';
import { useToast } from 'vue-toastification';
import { baseOpsRestRepo } from '@nxt/libraries/api-connection/repo/baseOpsRestRepo';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    field: {
      type: String,
      required: true,
    },
    settings: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const accountStore = useAccountStore();
    const toast = useToast();

    const showMe = computed(() => {
      const isSoftwareTeam = accountStore.myProfile?.member?.id === 41;
      return isSoftwareTeam && props.data.meter_interaction_status === 'FAILED';
    });

    const doRetry = () => baseOpsRestRepo
      .retryInteraction(props.data.id)
      .then(() => {
        toast.success('Retrying interaction');
      })
      .catch(err => {
        toast.error(err.message);
      })
    ;

    return { showMe, doRetry, mdiReload };
  },
};
</script>
