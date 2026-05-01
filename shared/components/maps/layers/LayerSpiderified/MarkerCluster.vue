<template>
<div
  ref="markerEl"
  :style="{ zIndex: isActive ? 1 : 0 }"
  @click.stop="onClick"
>
  <div
    class="marker-cluster"
    :class="{ 'marker-cluster--shrunk': isActive || store.hasBigZoom }"
    :style="{ 'background-color': backgroundColor }"
  >
    <span class="marker-cluster__text">{{ features.length }}</span>
    <!-- v-if="!backgroundColor" -->
    <donut-edge
      class="marker-cluster__donut"
      :features="features"
    />
    <!-- :style="{ 'opacity': backgroundColor ? 0.5 : 1 }" -->
  </div>
  <template v-if="isActive || store.hasBigZoom">
    <marker-spiderified
      v-for="feature in spideredFeatures"
      :key="feature.id"
      :feature="feature"
      :placement-options="feature.spiderLeg"
    />
  </template>
</div>
</template>

<script>
import { inject, ref, onMounted, onUnmounted, computed } from 'vue';
import { Marker } from 'mapbox-gl';
import { useSpiderStore } from './store/spider';
import { addCircleParams } from './lib/spider-helpers';

import MarkerSpiderified from './MarkerSpiderified.vue';
import DonutEdge from './DonutEdge.vue';

const SPIDERIFY_FROM_ZOOM = 17;

export default {
  props: {
    lngLat: {
      type: Array,
      required: true,
    },
    clusterId: {
      type: Number,
      required: true,
    },
    features: {
      type: Array,
      required: true,
    },
    backgroundColor: {
      type: String,
    },
  },

  setup(props) {
    const store = useSpiderStore();
    const markerEl = ref();
    const mbMap = inject('mbMap');
    const isActive = computed(() => store.activeClusterId === props.clusterId);
    let marker;

    onMounted(() => {
      marker = new Marker({
        element: markerEl.value,
        anchor: 'center',
      }).setLngLat(props.lngLat);

      marker.addTo(mbMap);
    });

    onUnmounted(() => {
      if(marker) marker.remove();
      if(isActive.value) store.setActiveCluster(undefined);
    });

    const spideredFeatures = computed(() => addCircleParams(props.features));

    const onClick = () => {
      const currentZoom = mbMap.getZoom();
      if(currentZoom < SPIDERIFY_FROM_ZOOM) {
        mbMap.easeTo({ center: props.lngLat, zoom: currentZoom + 2 });
        return;
      }
      // Timeout to run this after mapbox map click event
      const _cachedIsActive = isActive.value;
      setTimeout(() => {
        if(!_cachedIsActive) {
          store.setActiveCluster(props.clusterId);
        }
      }, 1);
    };

    return { store, markerEl, spideredFeatures, onClick, isActive };
  },

  components: { MarkerSpiderified, DonutEdge },
};
</script>

<style lang="scss">
.marker-cluster {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid $nxt-color-blue;
  background-color: $nxt-color-white;
  border-radius: 100%;
  font-size: 14px;
  overflow: hidden;

  box-shadow: 0 0 0 0 $nxt-color-blue;
  cursor: pointer;
  transition: 400ms $ease--out-expo;

  &__text {
    opacity: 1;
    transition: 400ms $ease--out-expo;
  }

  &--shrunk {
    width: 10px;
    height: 10px;
    background-color: $nxt-color-blue;
    z-index: 2;

    .marker-cluster__text,
    .marker-cluster__donut {
      opacity: 0;
    }
  }

  @media (hover: hover) {
    &:hover {
      box-shadow: 0 0 0 2px $nxt-color-blue;
    }
  }
}
</style>
