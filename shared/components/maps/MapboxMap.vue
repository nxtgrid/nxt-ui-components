<template>
<div ref="rootEl"></div>
<template v-if="mapReady">
  <slot></slot>
</template>
</template>

<script>
import { ref, onMounted, provide, onBeforeUnmount, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default {
  props: {
    center: {
      type: Array,
      default: () => [ 0, 0 ],
    },
    zoom: {
      type: Number,
      default: 0,
    },
    mapStyle: {
      type: String,
    },
    addScaleBar: {
      type: Boolean,
      default: false,
    },
    addFullscreenControl: {
      type: Boolean,
      default: false,
    },
    fitToBounds: {
      type: Object,
    },
    flyTo: {
      type: [ Array, Object ],
    },
    flyToZoom: {
      type: Number,
      default: 16,
    },
  },

  setup(props) {
    const rootEl = ref();
    const mapReady = ref(false);
    let mbMap;
    let resizeObserver;

    onMounted(() => {
      mbMap = new mapboxgl.Map({
        container: rootEl.value,
        style: (props.mapStyle ?? 'mapbox://styles/mapbox/satellite-streets-v12') + '?optimize=true',
        center: props.center,
        zoom: props.zoom,
      });

      if(props.addFullscreenControl) {
        const fullscreenControl = new mapboxgl.FullscreenControl();
        mbMap.addControl(fullscreenControl, 'top-right');
      }

      if(props.addScaleBar) {
        const scale = new mapboxgl.ScaleControl({
          maxWidth: 200,
          unit: 'metric',
        });
        mbMap.addControl(scale, 'bottom-right');
      }

      mbMap.on('load', () => {
        mapReady.value = true;
        // Zoom to coordinates
        if(props.flyTo && !props.fitToBounds) {
          mbMap.flyTo({ center: props.flyTo, zoom: props.flyToZoom });
        }
        watch(() => props.flyTo, flyTo => {
          if(mbMap) mbMap.flyTo({ center: flyTo, zoom: props.flyToZoom });
        });
        // Zoom to bounds
        if(props.fitToBounds) {
          mbMap.fitBounds(props.fitToBounds, { padding: 40 });
        }
        watch(() => props.fitToBounds, bounds => {
          if(mbMap && bounds) mbMap.fitBounds(bounds, { padding: 40 });
        });
      });

      provide('mbMap', mbMap);

      // Create a resize observer but don't trigger it the very first time,
      // because that happens when the map is initialized
      let observerReady = false;
      resizeObserver = new ResizeObserver(useDebounceFn(() => {
        if(!observerReady) {
          observerReady = true;
          return;
        }
        mbMap.resize();
      }, 300));
      resizeObserver.observe(rootEl.value);
    });

    onBeforeUnmount(() => {
      mbMap.remove();
      resizeObserver.unobserve(rootEl.value);
    });

    return { rootEl, mapReady };
  },
};
</script>

<style lang="scss">
.mapboxgl-map {
  height: 100%;
}

.mapboxgl-popup-content {
  padding: 1rem 16px;
}

.mapboxgl-ctrl-attrib.mapboxgl-compact {
  box-sizing: content-box;
}

.mapboxgl-ctrl-geocoder {
  font-size: 15px !important;
  line-height: 20px !important;

  &--input {
    height: 36px !important;
    padding: 6px 35px !important;
  }

  &--icon {
    top: 8px !important;
  }

  &--icon-search {
    left: 7px !important;
    width: 20px !important;
    height: 20px !important;
  }

  &--icon-close {
    width: 16px !important;
    height: 16px !important;
    margin-top: 3px !important;
    margin-right: 0 !important;
  }

  &--icon-loading {
    width: 26px !important;
    height: 26px !important;
    margin-top: -2px !important;
    margin-right: -5px !important;
  }
}

.mapbox-gl-draw_ctrl-draw-btn.active {
  background-color: rgba(255, 225, 0, 0.5) !important;
}
</style>

