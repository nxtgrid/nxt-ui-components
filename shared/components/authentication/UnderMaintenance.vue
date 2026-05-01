<template>
<div v-if="underMaintenance" class="maintenance">
  <nxt-logo class="maintenance-logo"/>
  <h1 class="h1-thin mt-1">Temporarily down for maintenance</h1>
  <p class="p mt-1">We are performing scheduled maintenance. We should be back online shortly.</p>
</div>
</template>

<script>
import ky from 'ky';
import { ref } from 'vue';
import { NxtLogo } from '@nxt/components/';

const MAINTENANCE_API_URL = import.meta.env.VITE_MAINTENANCE_API_URL;
const MAINTENANCE_CHECK_INTERVAL = 60000;

export default {
  setup() {
    const underMaintenance = ref(false);

    const checkMaintenanceStatus = () => ky
      .get(MAINTENANCE_API_URL)
      .json()
      .then(({ isUnderMaintenance }) => {
        console.info('In maintenance state: ', isUnderMaintenance);
        underMaintenance.value = isUnderMaintenance;
      })
      .catch(err => {
        console.error(err);
        underMaintenance.value = false;
      })
    ;

    const startMaintenanceCheckInterval = () => {
      if(import.meta.env.VITE_CONTEXT !== 'production') {
        console.info('Not checking for maintenance because not in production');
        return;
      }
      checkMaintenanceStatus();
      setInterval(checkMaintenanceStatus, MAINTENANCE_CHECK_INTERVAL);
    };

    startMaintenanceCheckInterval();

    return { underMaintenance };
  },
  components: { NxtLogo },
};
</script>

<style lang="scss">
.maintenance {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: $nxt-color-blue-bright;
  z-index: 9999;
}

.maintenance-logo {
  opacity: 0.1;
  width: 160px;
  height: auto;
}
</style>
