import { inject, onBeforeUnmount } from 'vue';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const coordinateFeature = (lng, lat) => ({
  center: [ lng, lat ],
  geometry: {
    type: 'Point',
    coordinates: [ lng, lat ],
  },
  place_name: 'Lat: ' + lat + ' Lng: ' + lng,
  place_type: [ 'coordinate' ],
  properties: {},
  type: 'Feature',
});

/**
 * Given a query in the form "lat, lng" or "lng, lat"
 * returns the matching geographic coordinate(s)
 * as search results in carmen geojson format,
 * https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
**/
const coordinatesGeocoder = query => {
  // Match anything which looks like
  // decimal degrees coordinate pair.
  const matches = query.match(
    /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i,
  );
  if (!matches) {
    return null;
  }

  const coord1 = Number(matches[1]);
  const coord2 = Number(matches[2]);
  const geocodes = [];

  if (coord1 < -90 || coord1 > 90) {
    // Must be lng, lat
    geocodes.push(coordinateFeature(coord1, coord2));
  }

  if (coord2 < -90 || coord2 > 90) {
    // Must be lat, lng
    geocodes.push(coordinateFeature(coord2, coord1));
  }

  if (geocodes.length === 0) {
    // Else could be either lng, lat or lat, lng
    geocodes.push(coordinateFeature(coord2, coord1));
    geocodes.push(coordinateFeature(coord1, coord2));
  }

  return geocodes;
};

export default {
  name: 'mapbox-geocoder-control',

  render: () => null,

  props: {
    showMarker: {
      type: Boolean,
      default: true,
    },
  },

  emits: [ 'result' ],

  setup(props, ctx) {
    const mbMap = inject('mbMap');

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      localGeocoder: coordinatesGeocoder,
      marker: props.showMarker,
      reverseGeocode: true,
    });

    geocoder.on('result', ({ result: { geometry } }) => {
      ctx.emit('result', geometry);
    });

    mbMap.addControl(geocoder);

    onBeforeUnmount(() => {
      if(!mbMap._removed) mbMap.removeControl(geocoder);
    });
  },
};
