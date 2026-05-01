<template>
<span class="no-wrap" :class="{ 'text-error': makeNegative }">
  {{ amountWithCurrency }}
</span>
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
    makeNegative() {
      return this.settings.negativeIf?.(this.data) ?? false;
    },

    positiveNegativeAmount() {
      return (this.makeNegative ? '-' : '') + path(this.field.split('.'), this.data);
    },

    amountWithCurrency() {
      return CURRENCY_MAP[this.data.currency ?? 'NGN'] + ' ' + this.positiveNegativeAmount;
    },
  },
};
</script>
