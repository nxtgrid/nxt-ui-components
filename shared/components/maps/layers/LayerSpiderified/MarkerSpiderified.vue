<template>
<Transition appear>
  <marker-smart
    class="marker-spiderified"
    :style="markerSpiderifiedStyle"
    :in-cluster="true"
    :feature="feature"
  />
</Transition>
<Transition appear>
  <div
    class="marker-dot"
    :style="markerDotStyle"
  ></div>
</Transition>
<Transition appear>
  <div
    class="spider-leg"
    :style="spiderLegStyle"
  ></div>
</Transition>
</template>

<script>
import { computed } from 'vue';
import { useSpiderStore } from './store/spider';
import MarkerSmart from '../../markers/MarkerSmart.vue';

export default {
  props: {
    feature: {
      type: Object,
      required: true,
    },
    placementOptions: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const store = useSpiderStore();

    const markerSpiderifiedStyle = computed(() => ({
      transform: `
        translate(-50%, -86%) 
        translate(${ props.placementOptions.x }px, ${ props.placementOptions.y }px)
      `,
    }));

    const markerDotStyle = computed(() => ({
      transform: `
        translate(-50%, -50%) 
        translate(${ props.placementOptions.x }px, ${ props.placementOptions.y }px)
      `,
    }));

    const spiderLegStyle = computed(() => ({
      height: props.placementOptions.legLength + 'px',
      transform: 'rotate(' + (props.placementOptions.angle + Math.PI / 2) + 'rad)',
    }));

    return { store, markerSpiderifiedStyle, markerDotStyle, spiderLegStyle };
  },

  components: { MarkerSmart },
};
</script>

<style lang="scss">
.marker-spiderified,
.marker-dot {
  position: absolute;
  top: 0;
  left: 0;
  transition: 400ms $ease--out-expo;
}

.marker-spiderified {
  z-index: 3;

  &.v-enter-from,
  &.v-leave-to {
    transform: translate(-50%, -86%) !important;
  }
}

.marker-dot {
  width: 6px;
  height: 6px;
  background: $nxt-color-blue;
  border-radius: 100%;

  z-index: 2;

  &.v-enter-from,
  &.v-leave-to {
    transform: translate(-50%, -50%) !important;
  }
}

.spider-leg {
  position: absolute;
  bottom: 0;
  left: -1px;
  width: 2px;
  background-color: $nxt-color-blue;
  opacity: 0.5;

  transform-origin: bottom;
  transition: height 400ms $ease--out-expo;
  z-index: 1;

  &.v-enter-from,
  &.v-leave-to {
    height: 0 !important;
  }
}
</style>
