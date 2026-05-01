<template>
<header class="card-header">
  <h1 class="h2">
    {{ gridName ?? '-' }}
  </h1>
  <dl class="pills">
    <router-link
      :to="customerMeterLink"
      title="Connected Customers"
      class="pill"
    >
      <dt class="pill__embedded"><mdi-icon :icon="mdiAccountOutline" :scale="20" /><mdi-icon :icon="mdiMeterElectricOutline" :scale="20" /></dt>
      <dd>{{ gridStatus.customer_count ?? 0 }}</dd>
    </router-link>
    <div class="pill">
      HPS
      <span
        class="status-light"
        :class="`status-light--${ gridStatus.is_hps_on ? 'green' : 'red' }`"
      ></span>
    </div>
    <div class="pill">
      FS
      <span
        class="status-light"
        :class="`status-light--${ (gridStatus.is_hps_on && gridStatus.is_fs_on) ? 'green' : 'red' }`"
      ></span>
    </div>
    <time-to-fs-indicator :grid-id="gridId" />
  </dl>
  <slot></slot>
</header>
</template>

<script>
import { mdiAccountOutline, mdiMeterElectricOutline } from '@mdi/js';
import TimeToFsIndicator from '@nxt/components/TimeToFsIndicator/TimeToFsIndicator.vue';

export default {
  props: {
    gridStatus: {
      type: Object,
      required: true,
    },
    gridId: {
      type: [ Number, String ],
      required: true,
    },
    gridName: {
      type: String,
    },
    customerMeterLink: {
      type: String,
      required: true,
    },
  },

  setup() {
    return { mdiAccountOutline, mdiMeterElectricOutline };
  },

  components: { TimeToFsIndicator },
};
</script>
