<template>
<!-- <under-maintenance /> -->
<div
  v-if="needRefresh"
  class="full-screen-cover sw-reload-cover"
>
  <div class="sw-reload-prompt">
    <p class="p">
      A new version of this app is available.
    </p>
    <nxt-button
      variant="primary"
      class="mt-1"
      @click="updateServiceWorker"
    >
      Click to update
    </nxt-button>
  </div>
</div>
</template>

<script>
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { watch } from 'vue';
import { useToast } from 'vue-toastification';
// import UnderMaintenance from '@nxt/components/authentication/UnderMaintenance.vue';

// Check for app update every hour
const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000;

export default {
  setup() {
    const $toast = useToast();
    const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
      onRegisteredSW(swUrl, registration) {
        // On registration of the Service Worker, we start a periodic check
        // for new versions of the Service Worker (and thus the entire application)
        registration && setInterval(async () => {
          if (!(!registration.installing && navigator)) return;
          if (('connection' in navigator) && !navigator.onLine) return;

          const res = await fetch(swUrl, {
            cache: 'no-store',
            headers: {
              'cache': 'no-store',
              'cache-control': 'no-cache',
            },
          });

          if(res?.status === 200) await registration.update();
        }, SW_UPDATE_INTERVAL_MS);
      },
    });

    watch(offlineReady, isReady => {
      if(isReady) $toast.success('App is now ready for offline use');
    });

    return { needRefresh, updateServiceWorker };
  },

  // components: { UnderMaintenance },
};
</script>

<style lang="scss">
.sw-reload-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-reload-prompt;
}

.sw-reload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  bottom: 1rem;
  right: 16px;
  background-color: $nxt-color-white;
  padding: 1rem 16px;
  border: thin solid $nxt-color-blue-light;
  border-radius: 4px;
  box-shadow: $sh1;
}
</style>
