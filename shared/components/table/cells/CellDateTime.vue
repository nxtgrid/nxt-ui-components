<template>
{{ formattedDateTime }}
</template>

<script>
import { computed } from 'vue';
import { useGlobalStore } from '@nxt/nxt-vue';
import { prettyLocalizedDateTime } from '@nxt/libraries/date-helpers';

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
    const globalStore = useGlobalStore();

    const formattedDateTime = computed(() => {
      const date = props.data[props.field];
      if(!date) return 'No date';

      return prettyLocalizedDateTime(globalStore.timezone)(date, {
        withSeconds: props.settings.withSeconds ?? false,
      });
    });

    return { formattedDateTime };
  },
};
</script>
