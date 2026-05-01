<template>
{{ feesPaid }}
</template>

<script>
import { path } from 'ramda';

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

  computed: {
    feesPaid() {
      const paid = path(this.field.split('.'), this.data);
      const total = this.data.total_connection_fee;

      if(this.settings.justYesNo) return paid >= total ? 'Yes' : 'No';

      if(paid === total) return 'Yes';
      else return '₦ ' + paid;
    },
  },
};
</script>
