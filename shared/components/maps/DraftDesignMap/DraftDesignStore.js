import { shallowRef } from 'vue';
import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';
import { geoRepo } from '@nxt/libraries/geoRepo';

export const BUILDING_DATA_SOURCES = [
  { label: 'Google Earth Engine', value: 'earth-engine-open-buildings' },
  { label: 'Open Street Map', value: 'osm' },
  { label: 'Microsoft Bing Maps (2021)', value: 'bing-maps-stored' },
];

export const useDraftDesignStore = defineStore('draft-design-store', {
  state: () => ({
    status: {
      isLoading: false,
      gotError: false,
    },

    gridLocation: {
      type: 'Point',
      // Coordinates are [ longitude, latitude ]
      coordinates: [ null, null ],
    },

    outlineDrawing: shallowRef(),

    settings: {
      building_data_source: BUILDING_DATA_SOURCES[0].value,
      minimum_building_area: 30,
      pole_coverage_radius: 50,
    },

    outline: shallowRef(),
    buildings: shallowRef(),
    poles: shallowRef(),
    distributionLines: shallowRef(),
    meta: {},

    tempBuildingPoints: shallowRef(),
  }),

  actions: {
    async submitOutline() {
      this.isLoading = true;
      this.gotError = false;
      this.outline = this.outlineDrawing;

      this.outlineDrawing = undefined;
      this.buildings = undefined;
      this.poles = undefined;
      this.distributionLines = undefined;
      this.meta = {};

      try {
        this.buildings = await geoRepo.getBuildings({
          outline: this.outline.geometry,
          min_building_area: this.settings.minimum_building_area,
          source: this.settings.building_data_source,
        });
        const pointFeatures = this.buildings.features
          .filter(({ properties }) => properties.connected)
          .map(({ properties }) => ({
            type: 'Feature',
            geometry: properties.closest_point,
            properties: {},
          }))
        ;
        this.tempBuildingPoints = { type: 'FeatureCollection', features: pointFeatures };
      }
      catch(err) {
        const title = 'Error getting buildings:';
        console.error(title, err);
        useToast().error(`${ title } ${ err.msg ?? err.message ?? err }`);
        this.gotError = true;
        this.isLoading = false;
        return 'error';
      }

      this.meta.served_building_count = this.tempBuildingPoints.features.length;
      this.meta.unserved_building_count = this.buildings.features.length - this.meta.served_building_count;
      this.meta.minimum_building_area = this.settings.minimum_building_area;

      try {
        this.poles = await geoRepo.getPoles({
          points: this.tempBuildingPoints,
          radius_in_meters: this.settings.pole_coverage_radius,
          // algo: 'kdtree',
        });
        this.tempBuildingPoints = undefined;
      }
      catch(err) {
        const title = 'Error calculating poles:';
        console.error(title, err);
        useToast().error(`${ title } ${ err.msg ?? err.message ?? err }`);
        this.gotError = true;
        this.isLoading = false;
        return 'error';
      }

      this.meta.pole_count = this.poles.features.length;
      this.meta.pole_coverage_radius = this.settings.pole_coverage_radius;

      try {
        this.distributionLines = await geoRepo.getDistributionLines({
          poles: this.poles,
        });
      }
      catch(err) {
        const title = 'Error calculating distribution:';
        console.error(title, err);
        useToast().error(`${ title } ${ err.msg ?? err.message ?? err }`);
        this.gotError = true;
        this.isLoading = false;
        return 'error';
      }

      const total_distribution_length = this.distributionLines.features
        .map(({ properties }) => properties.length_meters)
        .reduce((totalLength, length) => totalLength + length, 0)
      ;

      this.meta.distribution_line_total_length = Math.round(total_distribution_length);

      this.isLoading = false;
      return 'success';
    },

    clearGeo() {
      this.outline = undefined;
      this.buildings = undefined;
      this.poles = undefined;
      this.distributionLines = undefined;
      this.meta = {};
    },
  },

  persist: {
    pick: [
      'gridLocation',
      'outline',
      'buildings',
      'poles',
      'distributionLines',
      'meta',
    ],
  },
});
