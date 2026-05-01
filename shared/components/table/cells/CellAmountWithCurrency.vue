<template>
{{ amountWithCurrency }}
</template>

<script>
import { path } from 'ramda';
import { CURRENCY_MAP } from '@nxt/libraries/format-maps';

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
    amountWithCurrency() {
      const value = path(this.field.split('.'), this.data);
      return CURRENCY_MAP[this.data.currency ?? 'NGN'] + ' ' + value;
    },
  },
};
</script>
