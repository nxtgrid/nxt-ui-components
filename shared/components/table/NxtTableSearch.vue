<template>
<div class="nxt-input-with-icon">
  <input
    type="text"
    name="data-table-search"
    class="nxt-input"
    placeholder="Search..."
    v-model="internalSearch"
    :disabled="disabled"
  />
  <mdi-icon :icon="mdiMagnify" />
</div>
</template>

<script>
import { ref } from 'vue';
import { mdiMagnify } from '@mdi/js';
import { watchDebounced } from '@vueuse/core';

export default {
  props: {
    variables: {
      type: Object,
      required: true,
    },
    updateFn: {
      type: Function,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const internalSearch = ref(props.variables.search);
    const onSearch = search => {
      props.updateFn({ search, offset: 0 });
    };
    watchDebounced(
      internalSearch,
      onSearch,
      { debounce: 100, maxWait: 200 },
    );

    return { internalSearch, mdiMagnify };
  },
};
</script>
