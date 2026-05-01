<template>
<div>
  <div class="block-uptime">
    <uptime-bar
      name="High Priority Service"
      :bottom-medium-range="12"
      :bottom-positive-range="22"
      :uptimes="gridUptime.hps"
      :is-loading="isLoading"
      class="mb-1"
    />
    <uptime-bar
      name="Full Service"
      :bottom-medium-range="8"
      :bottom-positive-range="12"
      :uptimes="gridUptime.fs"
      :is-loading="isLoading"
    />
  </div>
  <p class="dashboard-card__title">Uptime</p>
  <div
    v-if="isLoading"
    class="scc scc-simple overlay-cover "
    style="position: absolute;"
  ></div>
</div>
</template>

<script>
import { ref } from 'vue';
import { baseOpsRestRepo } from '@nxt/libraries/api-connection/repo/baseOpsRestRepo';

import UptimeBar from './UptimeBar.vue';

const parseUptimeData = data => data.reduce(({ hps, fs }, { t, is_hps_on, is_fs_on }) => ({
  hps: [ ...hps, { time: t, value: is_hps_on } ],
  fs: [ ...fs, { time: t, value: is_fs_on } ],
}), { hps: [], fs: [] });

export default {
  props: {
    gridMeta: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const gridUptime = ref({ hps: [], fs: [] });
    const isLoading = ref(true);

    const getGridUptime = () => baseOpsRestRepo
      .getGridUptime(props.gridMeta.id)
      .then(parseUptimeData)
      .then(uptime => {
        gridUptime.value = uptime;
        isLoading.value = false;
      })
      .catch(err => {
        console.error('Error fetching grid uptime info', err);
      })
    ;
    getGridUptime();

    return { gridUptime, isLoading };
  },

  components: { UptimeBar },
};
</script>

<style lang="scss">
.block-uptime {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-evenly;
  padding-bottom: 1rem;

  // > :nth-child(2) {
  //   margin-top: 1rem;
  //   margin-top: auto;
  //   margin-bottom: auto
  // }
}
</style>
