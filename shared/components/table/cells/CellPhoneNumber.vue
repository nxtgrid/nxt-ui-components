<template>
{{ phoneNumber }}
</template>

<script>
import { path } from 'ramda';
import { formatPhone } from '@nxt/libraries/phone-helpers';

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
    phoneNumber() {
      const value = path(this.field.split('.'), this.data);
      return formatPhone(value);
    },
  },
};
</script>
