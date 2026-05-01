<script>
import { inject, watch } from 'vue';
import { Marker } from 'mapbox-gl';

// extend mapboxGL Marker so we can pass in an onClick handler
class ClickableMarker extends Marker {
  // new method onClick, sets _handleClick to a function you pass in
  onClick(handleClick) {
    this._handleClick = handleClick;
    return this;
  }

  // the existing _onMapClick was there to trigger a popup
  // but we are hijacking it to run a function we define
  _onMapClick(e) {
    const targetElement = e.originalEvent.target;
    const element = this._element;

    if (this._handleClick && (targetElement === element || element.contains((targetElement)))) {
      this._handleClick();
    }
  }
}

export default {
  props: {
    lngLat: {
      type: Array,
      required: true,
    },
    color: {
      type: String,
    },
  },

  emits: [ 'click' ],

  setup(props, ctx) {
    const mbMap = inject('mbMap');

    const marker = new ClickableMarker({
      color: props.color,
    })
      .setLngLat(props.lngLat)
      .onClick(() => {
        ctx.emit('click');
      })
      .addTo(mbMap)
    ;

    watch(() => props.lngLat, newVal => {
      marker.setLngLat(newVal);
      mbMap.flyTo({
        center: newVal,
        essential: true,
      });
    });
  },

  render: () => null,
};
</script>
