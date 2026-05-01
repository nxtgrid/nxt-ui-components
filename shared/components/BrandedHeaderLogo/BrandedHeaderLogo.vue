<template>
<img
  v-if="brand"
  :src="`/branding/${ brand.folder }/logo.png`"
  :alt="brand.name + ' logo'"
  class="header-logo header-logo--branded"
/>
<nxt-logo v-else class="header-logo" />
</template>

<script>
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { storeToRefs } from 'pinia';
import NxtLogo from '../NxtLogo/NxtLogo.vue';

export default {
  setup() {
    const { brand } = storeToRefs(useAccountStore());
    return { brand };
  },

  components: { NxtLogo },
};
</script>

<style lang="scss">
.header-logo{
  display: block;
  height: 32px;
  width: auto;
  margin-left: 4%;
  color: $nxt-color-white;

  &--branded {
    filter: invert(1);
  }

  @media(min-width: $ipad-horizontal) {
    height: 36px;
    margin-left: 20px;
  }
}
</style>
