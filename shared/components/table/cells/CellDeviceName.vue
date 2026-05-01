<template>
{{ meterName }}
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
    meterName() {
      const reference = path(this.field.split('.'), this.data);
      const { nickname } = this.data;
      return nickname ? `${ reference } (${ nickname })` : reference;
    },
  },
};
</script>
