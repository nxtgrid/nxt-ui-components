<template>
{{ cellValue }}
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
    cellValue() {
      const message = path(this.field.split('.'), this.data);
      if(this.data.meter?.external_reference) {
        return `Meter ${ this.data.meter.external_reference }: ${ message }`;
      }
      else if(this.data.connection?.id) {
        return `Connection ${ this.data.connection.id }: ${ message }`;
      }
      else {
        return message;
      }
    },
  },
};
</script>
