<template>
<svg
  class="donut-edge"
  :width="size"
  :height="size"
  :viewbox="`0 0 ${ size } ${ size }`"
>
  <path
    v-for="{ r, r0, x0, y0, x1, y1, largeArc, color } in segments"
    :key="color"
    :d="`M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${
      r + r * y0
    } A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${
      r + r0 * x1
    } ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${
      r + r0 * y0
    }`"
    :fill="color"
  />
</svg>
</template>

<script>
import { computed } from 'vue';

const COLOR_ORDER = [
  'mediumseagreen',
  'yellow',
  'tomato',
  'white',
];

const getColorCounts = features => {
  const colorCounts = COLOR_ORDER.map(color => ({ color: color, count: 0 }));
  features.forEach(({ marker }) => {
    const item = colorCounts.find(({ color }) => color === marker.circleColor);
    item.count++;
  });
  return colorCounts.filter(({ count }) => count);
};

const inferDonutSegment = ({ start, end, r, r0, color }) => {
  if (end - start === 1) end -= 0.00001;
  const a0 = 2 * Math.PI * (start - 0.25);
  const a1 = 2 * Math.PI * (end - 0.25);
  return {
    r,
    r0,
    x0: Math.cos(a0),
    y0: Math.sin(a0),
    x1: Math.cos(a1),
    y1: Math.sin(a1),
    largeArc: end - start > 0.5 ? 1 : 0,
    color,
  };
};

export default {
  props: {
    features: {
      type: Array,
      required: true,
    },
    size: {
      type: Number,
      default: 40,
    },
  },

  setup(props) {
    const segments = computed(() => {
      const total = props.features.length;
      const colorCounts = getColorCounts(props.features);
      let _offset = 0;
      const r = props.size / 2;
      const r0 = Math.round(r * 0.7);
      const counts = colorCounts.map(color => {
        const start = _offset;
        const end = start + color.count;
        _offset = end;
        return { color: color.color, start: start / total, end: end / total, r, r0 };
      });

      return counts.map(inferDonutSegment);
    });

    return { segments };
  },
};
</script>

<style lang="scss">
.donut-edge {
  position: absolute;
  display: block;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
