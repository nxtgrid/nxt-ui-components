<template>
<!-- Stop propagation to prevent parent cluster from closing -->
<div
  class="marker-smart"
  :class="{ 'marker-smart--active': isActive }"
  @click.stop
>
  <nxt-popover
    placement="top"
    :container-el="containerEl"
    show-close-button
    has-arrow
    :offset="12"
    @open="isActive = true"
    @close="isActive = false"
  >
    <template #trigger="{ uid, togglePopover }">
      <marker-graphic
        ref="markerEl"
        :id="uid"
        v-bind="feature.marker"
        :has-shadow="!inCluster"
        @click.stop="togglePopover"
      />
    </template>
    <template #default>
      <marker-popup :data="feature.popup" />
    </template>
  </nxt-popover>
</div>
</template>

<script>
import { ref, inject, onMounted, onBeforeUnmount } from 'vue';
import { Marker } from 'mapbox-gl';

import NxtPopover from '../../NxtPopover/NxtPopover.vue';
import MarkerGraphic from './MarkerGraphic.vue';
import MarkerPopup from './MarkerPopup.vue';

export default {
  props: {
    inCluster: {
      type: Boolean,
      default: false,
    },
    lngLat: {
      type: Array,
    },
    feature: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const mbMap = inject('mbMap');
    const containerEl = mbMap._container;
    const markerEl = ref();
    const isActive = ref(false);

    /**
     * If marker not in cluster, place on map
    **/
    if(!props.inCluster) {
      let marker;

      onMounted(() => {
        marker = new Marker({
          element: markerEl.value.$el,
          anchor: 'bottom',
        })
          .setLngLat(props.lngLat)
          .addTo(mbMap)
        ;
      });

      onBeforeUnmount(() => {
        if(marker) marker.remove();
      });
    }

    return { containerEl, markerEl, isActive };
  },

  components: { NxtPopover, MarkerGraphic, MarkerPopup },
};
</script>

<style lang="scss">
.marker-smart:hover,
.marker-smart.marker-smart--active {
  z-index: 5;
}
</style>
