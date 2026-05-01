<template>
<div class="marker-graphic">
  <svg
    class="marker-graphic__marker"
    display="block"
    :height="42 * scale + 'px'"
    :width="27 * scale + 'px'"
    viewBox="0 0 27 41"
  >
    <g fill-rule="nonzero">
      <g>
        <g :fill="markerColor">
          <path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path>
        </g>
        <g
          :fill="borderColor"
          :opacity="borderOpacity"
        >
          <path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path>
        </g>
        <g transform="translate(8.0, 8.0)">
          <!-- <circle fill="black" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle> -->
          <circle
            :fill="overrideCircleColor ?? circleColor"
            cx="5.5"
            cy="5.5"
            r="5.4999962"
          ></circle>
        </g>
      </g>
      <!-- <g transform="translate(6.0, 7.0)" fill="white"></g> -->
    </g>
  </svg>
  <svg
    v-if="hasShadow"
    class="marker-graphic__shadow"
    display="block"
    :height="42 * scale + 'px'"
    :width="27 * scale + 'px'"
    viewBox="0 0 27 41"
  >
    <ellipse
      transform="translate(3.0, 29.0)"
      fill="black"
      opacity="0.32"
      cx="10.5"
      cy="5.80029008"
      rx="10.5"
      ry="5.25002273"
    ></ellipse>
  </svg>
</div>
</template>

<script>
export default {
  props: {
    scale: {
      type: Number,
      default: 1,
    },
    markerColor: {
      type: String,
      default: 'white',
    },
    borderColor: {
      type: String,
      default: '#192c47',
    },
    borderOpacity: {
      type: Number,
      default: 0.25,
    },
    circleColor: {
      type: String,
      default: '#192c47',
    },
    overrideCircleColor: {
      type: String,
    },
    hasShadow: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss">
.marker-graphic {
  pointer-events: auto;
  user-select: auto;

  &__marker {
    position: relative;
    transition: 100ms ease-out;
    z-index: 1;
  }

  &__shadow {
    position: absolute;
    transform-origin: center bottom;
    transition: 100ms ease-out;
    top: 0;
    left: 0;
    z-index: 0;
  }

  &:hover {
    cursor: pointer;

    .marker-graphic__marker {
      transform: translateY(-5px);
    }

    .marker-graphic__shadow {
      transform: scale(0.8);
    }
  }
}
</style>
