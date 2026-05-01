<template>
<span
  v-if="formattedResult?.includes('<br>')"
  v-html="formattedResult"
  class="p"
></span>
<template v-else>{{ formattedResult }}</template>
</template>

<script>
import { METER_INTERACTIONS_MAP } from '@nxt/libraries/format-maps';

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
    formattedResult() {
      const interactionType = this.data[this.field];
      const formatter = METER_INTERACTIONS_MAP[interactionType];
      if(!formatter) {
        console.warn(`No formatter for meter interaction type ${ interactionType }`);
        return;
      }
      const formatFn = formatter.resultFormatFn;
      if(!formatFn) return;
      return formatFn(this.data);
    },
  },
};
</script>
