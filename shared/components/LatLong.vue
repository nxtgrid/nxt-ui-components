<template>
<span class="flex-horizontal">
  <span>
    {{ `${ lat ?? '-' }° N, ${ long ?? '-' }° E` }}
  </span>
  <click-to-copy :source="`${ lat }, ${ long }`" />
</span>
</template>

<script>
import ClickToCopy from './ClickToCopy/ClickToCopy.vue';

export default {
  props: {
    lat: {
      type: Number,
    },
    long: {
      type: Number,
    },
  },

  components: { ClickToCopy },
};
</script>
