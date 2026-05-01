<template>
<div class="satellite">
  <p
    v-if="connectionStatus?.status && connectionStatus.status !== 'success'"
    class="connection-message"
    :class="`text-${ connectionStatus.status }`"
  >
    No updates since {{ connectionStatus?.lastSeen }}
  </p>
  <mdi-icon
    v-if="connectionStatus?.status"
    :icon="connectionStatus.status === 'success' ? mdiAccessPoint : mdiAccessPointOff"
    class="connection-status"
    :class="`text-${ connectionStatus.status }`"
  />
  <svg
    width="20"
    height="24"
    viewBox="0 0 20 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 24V14"
      stroke="#525252"
      stroke-width="4"
    />
    <path
      d="M14.8284 13.8284C17.7136 10.9432 17.9343 6.40244 15.4905 3.26395C15.1512 2.82819 14.5118 2.83124 14.1213 3.22177L9.17156 8.17151L4.22182 13.1213C3.83129 13.5118 3.82824 14.1512 4.264 14.4905C7.40249 16.9343 11.9432 16.7136 14.8284 13.8284Z"
      stroke="#525252"
      stroke-width="4"
    />
    <path
      d="M4 3L6.82843 5.82843"
      stroke="#525252"
      stroke-width="4"
    />
  </svg>
</div>
</template>

<script>
import { mdiAccessPoint, mdiAccessPointOff } from '@mdi/js';

export default {
  props: {
    connectionStatus: {
      type: Object,
    },
  },

  setup() {
    return { mdiAccessPoint, mdiAccessPointOff };
  },
};
</script>

<style lang="scss">
.satellite {
  display: flex;
  position: relative;
}

.connection-status {
  position: absolute;
  bottom: 15px;
  right: 11px;
  z-index: 1;
  transform: rotate(-45deg);
}

.connection-message {
  position: absolute;
  font-size: 0.625rem;
  line-height: 1.6;
  white-space: nowrap;
  bottom: 39px;
  right: 50%;
  margin-right: 12px;
  transform: translateX(50%);
}
</style>
