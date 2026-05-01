<template>
<div v-if="isNxtUser" style="border: thin solid #dbdbdb; padding: 1rem 16px; margin-block: 1rem; border-radius: 8px;">
  <p class="p text-bold mb-1">For NXT 👀 only</p>
  <slot/>
</div>
</template>

<script>
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';

export default {
  setup() {
    const isNxtUser = useAccountStore().isNxtGridMember;

    return { isNxtUser };
  },
};
</script>
