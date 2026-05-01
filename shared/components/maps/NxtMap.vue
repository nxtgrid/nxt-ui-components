<template>
<mapbox-map
  :center="CENTER_NIGERIA"
  :zoom="5"
  map-style="mapbox://styles/mapbox/satellite-streets-v12"
  :fly-to="flyTo"
  :fit-to-bounds="bounds"
  :add-fullscreen-control="addFullscreenControl"
>
  <slot name="controls" />
  <control-style-switch />

  <!-- Buildings -->
  <layer-geojson
    v-if="geoBuildings"
    name="geo-buildings"
    type="fill"
    :paint="{
      'fill-color': [
        'case',
        ['!', ['has', 'connected']], // Blue if 'connected' does not exist
        '#0080ff',
        ['get', 'connected'], // Use 'connected' directly
        '#0080ff', // Blue if 'connected' is true
        'red' // Red otherwise
      ],
      'fill-opacity': 0.8,
    }"
    :geojson="geoBuildings"
  />

  <!-- Outline -->
  <layer-geojson
    v-if="geoOutline"
    name="geo-outline"
    type="line"
    :layout="{
      'line-join': 'round',
      'line-cap': 'round',
    }"
    :paint="{
      'line-color': 'yellow',
      'line-width': 2,
    }"
    :geojson="geoOutline"
  />

  <!-- Distribution Lines -->
  <layer-geojson
    v-if="geoDistributionLines"
    name="geo-distribution-lines"
    type="line"
    :layout="{
      'line-join': 'round',
      'line-cap': 'round',
    }"
    :paint="{
      'line-color': 'black',
      'line-width': 2,
    }"
    before="geo-poles-layer"
    :geojson="geoDistributionLines"
  />

  <!-- Poles -->
  <layer-geojson
    v-if="geoPoles"
    name="geo-poles"
    type="circle"
    :paint="{
      'circle-radius': 3,
      'circle-stroke-width': 2,
      'circle-color': 'limegreen',
      'circle-stroke-color': 'black',
    }"
    :geojson="geoPoles"
  />

  <!-- Pole coverage disks -->
  <layer-geojson
    v-if="geoPoleCoverages && showPoleCoverage"
    name="geo-pole-coverages"
    type="fill"
    :paint="{
      'fill-color': 'lime',
      'fill-opacity': 0.2,
      'fill-outline-color': 'black',
    }"
    before="geo-buildings-layer"
    :geojson="geoPoleCoverages"
  />

  <!-- Grid -->
  <layer-geojson
    v-if="geoGridLocation"
    name="geo-grid"
    type="circle"
    :paint="{
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-color': 'yellow',
      'circle-stroke-color': 'black',
    }"
    :geojson="geoGridLocation"
  />

  <slot name="layers" />
</mapbox-map>
</template>

<script>
import { computed } from 'vue';
import { bbox } from '@turf/bbox';
import { circle } from '@turf/circle';
import { CENTER_NIGERIA } from '@nxt/libraries/constants';

import MapboxMap from './MapboxMap.vue';
import LayerGeojson from './layers/LayerGeojson';
import ControlStyleSwitch from './controls/ControlStyleSwitch';

export default {
  props: {
    geoGridLocation: {
      type: Object,
    },
    geoOutline: {
      type: Object,
    },
    geoBuildings: {
      type: Object,
    },
    geoPoles: {
      type: Object,
    },
    geoDistributionLines: {
      type: Object,
    },
    showPoleCoverage: {
      type: Boolean,
      default: false,
    },
    poleCoverageRadius: {
      type: Number,
    },
    flyTo: {
      type: [ Array, Object ],
    },
    addFullscreenControl: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const bounds = computed(() => {
      if(props.geoOutline) return bbox(props.geoOutline);
      return undefined;
    });

    const geoPoleCoverages = computed(() => {
      if(!props.poleCoverageRadius || !props.geoPoles?.features.length) return undefined;
      const radiusKilometers = props.poleCoverageRadius / 1000;
      const features = props.geoPoles.features.map(feature => circle(feature, radiusKilometers));
      return { type: 'FeatureCollection', features };
    });

    return { bounds, geoPoleCoverages, CENTER_NIGERIA };
  },

  components: { MapboxMap, LayerGeojson, ControlStyleSwitch },
};
</script>
