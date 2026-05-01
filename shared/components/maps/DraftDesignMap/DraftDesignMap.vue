<template>
<div class="draft-design-map">
  <transition name="slide-right">
    <div
      v-if="accountStore.isNxtGridMember && ddStore.meta.distribution_line_total_length"
      class="draft-design-map__meta card"
    >
      <table class="draft-design-map__meta__table">
        <tbody>
          <tr>
            <th>Number of buildings served</th>
            <td>{{ ddStore.meta.served_building_count }}</td>
          </tr>
          <tr>
            <th>Number of buildings unserved</th>
            <td>{{ ddStore.meta.unserved_building_count }}</td>
          </tr>
          <tr>
            <th>Number of poles</th>
            <td>{{ ddStore.meta.pole_count }}</td>
          </tr>
          <tr>
            <th>Single conductor distribution length (m)</th>
            <td>{{ ddStore.meta.distribution_line_total_length }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </transition>
  <nxt-map
    :geo-grid-location="ddStore.gridLocation"
    :geo-outline="ddStore.outline"
    :geo-buildings="ddStore.buildings"
    :geo-poles="ddStore.poles"
    :geo-distribution-lines="ddStore.distributionLines"
    :pole-coverage-radius="ddStore.meta.pole_coverage_radius"
    :show-pole-coverage="true"
    :fly-to="ddStore.gridLocation?.coordinates"
  >
    <template v-slot:controls v-if="!ddStore.outline || (editMode && !ddStore.isLoading)">
      <control-geocoder
        :show-marker="false"
        @result="geom => { ddStore.gridLocation = geom; }"
      />
      <control-outline-draw
        @change="geom => { ddStore.outlineDrawing = geom; }"
      />
    </template>
    <template v-slot:layers>
      <layer-geojson
        v-if="ddStore.tempBuildingPoints"
        name="geo-building-points"
        type="circle"
        :paint="{
          'circle-radius': 3,
          'circle-stroke-width': 1,
          'circle-color': 'firebrick',
          'circle-stroke-color': 'black',
        }"
        :geojson="ddStore.tempBuildingPoints"
      />
    </template>
  </nxt-map>
</div>
</template>

<script>
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { useDraftDesignStore } from './DraftDesignStore';

import NxtMap from '../NxtMap.vue';
import LayerGeojson from '../layers/LayerGeojson';
import ControlGeocoder from '../controls/ControlGeocoder';
import ControlOutlineDraw from '../controls/ControlOutlineDraw';

export default {
  props: {
    editMode: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const accountStore = useAccountStore();
    const ddStore = useDraftDesignStore();

    return { accountStore, ddStore };
  },

  components: { NxtMap, LayerGeojson, ControlGeocoder, ControlOutlineDraw },
};
</script>

<style lang="scss">
.draft-design-map {
  position: relative;
  height: 100%;
  overflow: hidden;

  &__meta {
    position: absolute;
    max-width: 80%;
    left: -4px;
    top: -4px;
    padding: 3px 0 0 3px !important;
    z-index: 2;

    &__table {
      text-align: left;
      border-collapse: collapse;
      font-size: 0.875rem;

      th, td {
        padding: 0.5rem 8px;
        border: thin solid $nxt-color-blue-light;
      }
    }
  }
}

.slide-right {
  &-enter-active,
  &-leave-active {
    transition: transform 600ms $ease--out-expo;
  }

  &-enter-from,
  &-leave-to {
    transform: translateX(-100%);
  }
}
</style>
