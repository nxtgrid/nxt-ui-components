<template>
<div class="live-generation-status">
  <div class="live-generation-status__block">
    <div class="live-generation-status__graphic">

    </div>
    <div class="live-generation-status__text">
      <p>
        Consuming
        {{ gridMqttData?.powerConsumption?.value.toLocaleString() ?? '-' }}W
      </p>
    </div>
  </div>
  <div class="live-generation-status__block">
    <div class="live-generation-status__graphic">
      <panel-energy-cabin
        :charge="gridMqttData?.batteryState?.value"
        :connection-status="connectionStatus"
        :screen-width="screenWidth"
      />
    </div>
    <div class="live-generation-status__text">
      <p>
        Charge
        {{ gridMqttData?.batteryState?.value ?? '-' }}%
      </p>
    </div>
    <antsy-tubes
      class="live-generation-status__tubes-l"
      :has-connection="hasWorkingConnection"
    />
    <antsy-tubes
      class="live-generation-status__tubes-r"
      :has-connection="hasWorkingConnection"
    />
  </div>
  <div class="live-generation-status__block">
    <div class="live-generation-status__graphic">
      <panel-solar-panels :screen-width="screenWidth" />
    </div>
    <div class="live-generation-status__text">
      <p>
        Yielding
        {{ gridMqttData?.solarYield?.value.toLocaleString() ?? '-' }}W
      </p>
    </div>
  </div>
</div>
</template>
<script>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { useMqtt } from '@nxt/composables/useMqtt';

import PanelEnergyCabin from './PanelEnergyCabin.vue';
import PanelSolarPanels from './PanelSolarPanels.vue';
import AntsyTubes from './AntsyTubes.vue';
import { prettyLocalizedDateTime } from '@nxt/libraries/date-helpers';

export default {
  props: {
    gridMeta: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const { mqttData, subscribeGrid } = useMqtt();
    const mqttId = props.gridMeta.generation_external_gateway_id;
    const mqttClient = subscribeGrid(mqttId);
    const gridMqttData = computed(() => mqttData[mqttId]);
    const hasMadeFirstConnection = computed(() =>
      (gridMqttData.value ? Object.keys(gridMqttData.value).length : 0) > 1);
    const hasWorkingConnection = computed(() => hasMadeFirstConnection.value && gridMqttData.value?.hasConnection);

    const gridInfo = ref();
    baseSupabaseRepo.client
      .from('grids')
      .select('generation_gateway_last_seen_at') // , kwh, kwp
      .eq('id', props.gridMeta.id)
      .maybeSingle()
      .then(baseSupabaseRepo.handleResponse)
      .then(data => { gridInfo.value = data; })
    ;

    const makePrettyDate = prettyLocalizedDateTime(props.gridMeta.timezone);

    const connectionStatus = computed(() => {
      if(!gridInfo.value || !gridMqttData.value) return undefined;
      const returnObj = {
        lastSeen: gridInfo.value?.generation_gateway_last_seen_at && makePrettyDate(gridInfo.value.generation_gateway_last_seen_at),
        status: hasMadeFirstConnection.value ? 'highlight' : undefined, // we abuse highlight as pending for text coloration
      };
      if(!gridMqttData.value.hasConnection) returnObj.status = 'error';
      if(gridMqttData.value.hasReceivedLiveData) returnObj.status = 'success';
      return returnObj;
    });

    // const timedOut = ref(false);

    // setTimeout(() => {
    //   timedOut.value = true;
    // }, 3000);

    /**
     * Width tracker
    **/

    const screenWidth = ref(window.innerWidth);
    const updateWidth = () => { screenWidth.value = window.innerWidth; };

    onMounted(() => {
      window.addEventListener('resize', updateWidth);
      updateWidth;
    });

    onBeforeUnmount(() => {
      mqttClient.destroy();
      window.removeEventListener('resize', updateWidth);
    });

    return { gridMqttData, hasMadeFirstConnection, hasWorkingConnection, connectionStatus, screenWidth /* timedOut */ };
  },

  components: { PanelEnergyCabin, PanelSolarPanels, AntsyTubes },
};
</script>

<style lang="scss">
$sketch-color: #525252;

.live-generation-status {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 8px;
  margin-inline: -8px;
  color: $sketch-color;
  font-family: 'Arial Black', 'Arial Bold', Gadget, sans-serif;

  &__block {
    position: relative;
    // box-shadow: 0 0 0 1px #f1f1f1;
  }

  &__graphic {
    position: relative;
    height: 120px;

    &::after {
      @include pseudo;
      width: 100%;
      height: 4px;
      bottom: 0;
      background: $sketch-color;
    }
  }

  &__text {
    width: 116%;
    margin-left: -8%;
    margin-bottom: 0.75rem;
    font-size: 0.625rem;
    text-align: center;
    line-height: 1.6;
  }

  &__tubes-l {
    right: 67%;
    bottom: -0.5rem;
  }

  &__tubes-r {
    left: 67%;
    bottom: -0.5rem;
  }

  @media(min-width: $mobile-horizontal) {
    &__text {
      font-size: 0.6875rem;
      line-height: 1.125rem;
    }
  }

  @media(min-width: $ipad-vertical) {
    column-gap: 16px;

    // &__block {
    //   padding-top: 0;
    // }

    &__graphic {
      height: 200px;
    }
    &__tubes {
      left: calc(-40% - 8px);
    }
    &__text {
      font-size: 0.75rem;
      line-height: 1.25rem;
      margin-top: 0.125rem;
    }
  }

  @media(min-width: $macbook-pro) {
    &__text {
      margin-top: 0.25rem;
      margin-bottom: 0.875rem;
    }
  }
}
</style>
