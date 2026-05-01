<template>
<div
  v-for="marker in clusterMarkers"
  :key="marker.id"
>
  <marker-cluster
    :cluster-id="marker.id"
    :lng-lat="marker.lngLat"
    :features="marker.features"
    :background-color="marker.backgroundColor"
  />
</div>
<marker-smart
  v-for="marker in singleMarkers"
  :key="marker.id"
  :lng-lat="marker.lngLat"
  :feature="marker.feature"
/>
</template>

<script>
import { partition, evolve, uniqBy } from 'ramda';
import { inject, onBeforeUnmount, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useSpiderMarkers } from './lib/marker-data-helpers';
import { useSpiderStore } from './store/spider';

import MarkerCluster from './MarkerCluster.vue';
import MarkerSmart from '../../markers/MarkerSmart.vue';

const SOURCE_ID = 'nxtpins';
const LAYER_ID = 'invisible';

const getClusterFeatures = (source, clusterId) => new Promise((resolve, reject) => {
  source.getClusterLeaves(clusterId, Infinity, 0, (err, features) => {
    if(err) return reject(err);
    resolve(features);
  });
});

export default {
  name: 'mapbox-geojson-layer',

  props: {
    geojson: {
      type: Object,
      required: true,
    },

    markerType: {
      type: String,
      default: 'meter',
    },

    formatMap: {
      type: Object,
    },

    generateLinkFunction: {
      type: Function,
    },
  },

  setup(props, _ctx) {
    const mbMap = inject('mbMap');
    const store = useSpiderStore();

    const { singleMarkers, clusterMarkers, updateFromMapbox } =
      useSpiderMarkers(props.markerType, props.formatMap, props.generateLinkFunction);

    const _addLayer = () => {
      mbMap.addSource(SOURCE_ID, {
        type: 'geojson',
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 25,
        data: props.geojson,
      });

      mbMap.addLayer({
        id: LAYER_ID,
        type: 'circle',
        paint: {
          'circle-radius': 0,
        },
        source: SOURCE_ID,
        'filter': [ '!=', 'cluster', true ],
      });

      const updateMarkers = async () => {
        if(!mbMap?.style) return;
        const _features = mbMap.querySourceFeatures(SOURCE_ID);
        const [ _clusters, _singles ] = partition(({ properties }) => properties.cluster, _features);
        const _uniqClusters = uniqBy(({ properties }) => properties.cluster_id, _clusters);
        const _uniqSingles = uniqBy(({ properties }) => properties.id, _singles);

        const clusterMarkerPromises = _uniqClusters.map(async feature => {
          const source = mbMap.getSource(SOURCE_ID);
          const clusterId = feature.properties.cluster_id;
          return {
            id: clusterId,
            lngLat: feature.geometry.coordinates,
            features: (await getClusterFeatures(source, clusterId))
              .map(({ properties }) => properties),
          };
        });

        const newClusterMarkers = await(Promise.all(clusterMarkerPromises));

        const newSingleMarkers = _uniqSingles.map(feature => ({
          id: feature.properties.id,
          lngLat: feature.geometry.coordinates,
          // For single markers we need to revert some JSON stringifying
          feature: evolve({
            connection: JSON.parse,
            last_encountered_issue: JSON.parse,
            command: JSON.parse,
            gateway: JSON.parse,
            account: JSON.parse,
            issue: JSON.parse,
            pole: JSON.parse,
          }, feature.properties),
        }));

        updateFromMapbox({ newSingleMarkers, newClusterMarkers });
        store.setHasBigZoom(mbMap.getZoom());
      };

      const updateMarkersDebounced = useDebounceFn(updateMarkers, 100, { maxWait: 500 });

      const firstRenderFn = () => {
        if(!mbMap.isSourceLoaded(SOURCE_ID)) return;
        updateMarkers();
        mbMap.off('render', firstRenderFn);
        mbMap.on('move', updateMarkersDebounced);
      };

      mbMap.on('render', firstRenderFn);

      mbMap.on('click', () => {
        store.setActiveCluster(undefined);
      });
    };

    _addLayer();

    const _removeLayer = () => {
      const existingLayer = mbMap.getLayer(LAYER_ID);
      if(existingLayer) mbMap.removeLayer(LAYER_ID);
      const existingSource = mbMap.getSource(SOURCE_ID);
      if(existingSource) mbMap.removeSource(SOURCE_ID);
    };

    const _updateLayer = newData => {
      const existingSource = mbMap.getSource(SOURCE_ID);
      if(existingSource) existingSource.setData(newData);
    };

    // Re-add layer when style is changed
    // (style change clears all layers)
    mbMap.on('style.load', () => {
      _removeLayer();
      _addLayer();
    });

    watch(() => props.geojson, _updateLayer);

    onBeforeUnmount(() => {
      if(!mbMap.style) return;
      _removeLayer();
    });

    return { store, singleMarkers, clusterMarkers };
  },

  components: { MarkerCluster, MarkerSmart },
};
</script>
