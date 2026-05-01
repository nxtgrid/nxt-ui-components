<template>
<nxt-button
  v-if="showMe"
  title="Verify Order"
  variant="primary"
  size="small"
  :icon-svg="mdiReload"
  icon-only
  @click.stop="doVerify"
/>
</template>

<script>
import { baseOpsRestRepo } from '@nxt/libraries/api-connection/repo/baseOpsRestRepo';
import { useToast } from 'vue-toastification';
import { mdiReload } from '@mdi/js';

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

  setup() {
    return { mdiReload };
  },

  methods: {
    doVerify() {
      const toast = useToast();
      baseOpsRestRepo
        .verifyOrder(this.data.id)
        .then(() => {
          toast.success('Order verification process started');
        })
        .catch(err => {
          toast.error(err.message);
        })
      ;
    },
  },

  computed: {
    showMe() {
      return this.data.external_reference && [ 'INITIALISED', 'TIMED_OUT' ].includes(this.data.order_status);
    },
  },
};
</script>
