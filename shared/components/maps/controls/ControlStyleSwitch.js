import { inject, onBeforeUnmount } from 'vue';
import { MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher';
import 'mapbox-gl-style-switcher/styles.css';

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [ 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' ],
      tileSize: 256,
      attribution: 'Raster map by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>',
    },
  },
  layers: [ {
    id: 'osm',
    type: 'raster',
    source: 'osm',
  } ],
};

export default {
  name: 'mapbox-style-switcher',

  render: () => null,

  setup() {
    const mbMap = inject('mbMap');
    const DEFAULT_STYLES = MapboxStyleSwitcherControl.DEFAULT_STYLES;
    const styles = [ ...DEFAULT_STYLES, { title: 'OSM', uri: OSM_STYLE } ];

    const switcherControl = new MapboxStyleSwitcherControl(styles, 'Satellite');

    mbMap.addControl(switcherControl, 'bottom-right');

    onBeforeUnmount(() => {
      if(!mbMap._removed) mbMap.removeControl(switcherControl);
    });
  },
};
