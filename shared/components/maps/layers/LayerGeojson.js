import { inject, onBeforeUnmount, watch } from 'vue';
import mapboxgl from 'mapbox-gl';

export default {
  name: 'mapbox-geojson-layer',

  render: () => null,

  props: {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    filter: {
      type: Array,
    },

    paint: {
      type: Object,
      required: true,
    },

    layout: {
      type: Object,
    },

    label: {
      type: Object,
    },

    before: {
      type: String,
    },

    geojson: {
      type: Object,
      required: true,
    },

    registerClickFn: {
      type: Function,
    },
  },

  setup(props, _ctx) {
    const mbMap = inject('mbMap');

    const sourceId = `${ props.name }-source`;
    const layerId = `${ props.name }-layer`;
    const labelLayerId = `${ props.name }-label`;
    let clickFn;

    const _addLayer = () => {
      mbMap.addSource(sourceId, {
        type: 'geojson',
        data: props.geojson,
      });

      const layerOptions = {
        id: layerId,
        type: props.type,
        source: sourceId,
        paint: props.paint,
      };

      if(props.filter) {
        layerOptions.filter = props.filter;
      }

      if(props.layout) {
        layerOptions.layout = props.layout;
      }

      // If we use Mapbox Draw, we want all the drawn layers to be on top,
      // so we add this layer BELOW the lowest known layer used by Mapbox Draw
      const LOWEST_DRAW_LAYER_ID = 'gl-draw-polygon-fill-inactive.cold';
      let layerOnTopOfMe;
      if(props.before && mbMap.getLayer(props.before))
        layerOnTopOfMe = props.before;
      else if(mbMap.getLayer(LOWEST_DRAW_LAYER_ID))
        layerOnTopOfMe = LOWEST_DRAW_LAYER_ID;

      mbMap.addLayer(layerOptions, layerOnTopOfMe);

      if(props.label) {
        const labelLayerOptions = {
          id: labelLayerId,
          type: 'symbol',
          source: sourceId,
          layout: {
            'symbol-placement': 'point',
            'text-field': '{title}',
            'text-size': props.label['text-size'] || 12,
            'text-allow-overlap': true,
          },
          paint: {
            'text-halo-color': 'rgba(255, 255, 255, 0.9)',
            'text-halo-width': 3,
            'text-translate': props.label['text-translate'] || [ 0, 20 ],
          },
        };

        if(props.label.minzoom)
          labelLayerOptions.minzoom = props.label.minzoom;

        mbMap.addLayer(labelLayerOptions, layerId);
      }

      if(props.registerClickFn) {
        clickFn = props.registerClickFn({ mapboxgl, mbMap });
        mbMap.on('click', layerId, clickFn);
      }
    };

    _addLayer();

    const _removeLayer = () => {
      if(props.label) {
        const existingLabelLayer = mbMap.getLayer(labelLayerId);
        if(existingLabelLayer) mbMap.removeLayer(labelLayerId);
      }
      const existingLayer = mbMap.getLayer(layerId);
      if(existingLayer) mbMap.removeLayer(layerId);
      const existingSource = mbMap.getSource(sourceId);
      if(existingSource) mbMap.removeSource(sourceId);
      if(clickFn) {
        mbMap.off('click', layerId, clickFn);
      }
    };

    // Re-add layer when style is changed
    // (style change clears all layers)
    mbMap.on('style.load', () => {
      _removeLayer();
      _addLayer();
    });

    watch(() => props.geojson, newData => {
      mbMap.getSource(sourceId).setData(newData);
    });

    onBeforeUnmount(() => {
      if(!mbMap.style) return;
      _removeLayer();
    });
  },
};
