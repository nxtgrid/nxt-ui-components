<template>
<nxt-button
  variant="primary"
  title="Log in with Google"
  :icon-svg="iconPath"
  icon-only
  size="small"
  @click="loginWithGoogle"
/>
</template>

<script>
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';

export default {
  setup() {
    const loginWithGoogle = () => {
      baseSupabaseRepo.loginWithOAuth('google');
    };

    const iconPath = 'M0 12C0 5.3832 5.3832 0 12 0C14.6723 0 17.2017 0.859772 19.3147 2.4864L16.5262 6.1088C15.2197 5.10309 13.6545 4.57143 12 4.57143C7.90389 4.57143 4.57143 7.90389 4.57143 12C4.57143 16.0961 7.90389 19.4286 12 19.4286C15.2991 19.4286 18.1026 17.2671 19.0688 14.2857H12V9.71429H24V12C24 18.6168 18.6168 24 12 24C5.3832 24 0 18.6168 0 12Z';

    return { loginWithGoogle, iconPath };
  },
};
</script>
