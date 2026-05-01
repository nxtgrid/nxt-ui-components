import { inject, onBeforeUnmount } from 'vue';
import { init } from 'ramda';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export default {
  name: 'mapbox-draw-control',

  render: () => null,

  emits: [ 'change' ],

  setup(props, ctx) {
    const mbMap = inject('mbMap');
    const mbDraw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_polygon',
    });

    mbMap.addControl(mbDraw);

    const onChangeFn = () => {
      const { features } = mbDraw.getAll();
      const feature = features[0];
      ctx.emit('change', feature);
    };

    const onModeChangeFn = ({ mode }) => {
      // Delete old polygons so there can only be one
      if(mode === 'draw_polygon') {
        const { features } = mbDraw.getAll();
        const ids = init(features).map(({ id }) => id);
        mbDraw.delete(ids);
      }
    };

    mbMap
      .on('draw.create', onChangeFn)
      .on('draw.delete', onChangeFn)
      .on('draw.update', onChangeFn)
      .on('draw.modechange', onModeChangeFn)
    ;

    onBeforeUnmount(() => {
      if(!mbMap._removed) {
        mbMap
          .removeControl(mbDraw)
          .off('draw.create', onChangeFn)
          .off('draw.delete', onChangeFn)
          .off('draw.update', onChangeFn)
          .off('draw.modechange', onModeChangeFn)
        ;
      }
    });
  },
};
