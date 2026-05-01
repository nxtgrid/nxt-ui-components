<template>
<div class="dual-slider">
  <div ref="dualSlider"></div>
</div>
</template>

<script>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

export default {
  props: {
    startHalfHours: {
      type: Number,
      default: 0,
    },
    modelValue: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: [ 'update:modelValue' ],

  setup(props, { emit }) {
    const dualSlider = ref(null);

    const formatTime = type => number => {
      const _rounded = Math.round(number);
      _rounded;
      const _numberAbs = props.startHalfHours + _rounded;
      const _number = _numberAbs >= 48 ? _numberAbs - 48 : _numberAbs;
      const hours = String(Math.floor(_number / 2)).padStart(2, '0');
      const minutes = _number % 2 ? '30' : '00';
      return `${ type }<br>${ hours }:${ minutes }`;
    };

    let _slider;
    let _isInternalUpdate = false;

    onMounted(() => {
      _slider = noUiSlider.create(dualSlider.value, {
        start: props.modelValue.map(({ halfHoursFromNow }) => halfHoursFromNow),
        range: { min: 0, max: 48 },
        step: 1, // Each step = half-hour
        behaviour: 'unconstrained-invert-connects',
        connect: true,
        tooltips: [
          { to: formatTime('ON') },
          { to: formatTime('OFF') },
        ],
      });
      _slider.on('change', ([ onVal, offVal ]) => {
        _isInternalUpdate = true;
        emit('update:modelValue', [
          { 'fs_command': 'ON', halfHoursFromNow: Number(onVal) },
          { 'fs_command': 'OFF', halfHoursFromNow: Number(offVal) },
        ]);
      });

      if (props.disabled) _slider.disable();
    });

    watch(() => props.disabled, newVal => {
      if (newVal) _slider?.disable();
      else _slider?.enable();
    });

    watch(() => props.modelValue, newValue => {
      if(!_isInternalUpdate) {
        const onVal = newValue[0].halfHoursFromNow;
        const offVal = newValue[1].halfHoursFromNow;
        _slider?.set([ onVal, offVal ]);
      }
      _isInternalUpdate = false;
    });

    onUnmounted(() => {
      _slider?.destroy();
    });

    return { dualSlider };
  },

};
</script>

<style lang="scss">
.dual-slider {
  padding-bottom: 2.75rem;

  .noUi-connect {
    background: $nxt-color-blue-highlight;
  }

  [disabled] .noUi-connect {
    background: $nxt-color-blue-light;
  }

  .noUi-tooltip {
    bottom: auto;
    top: 105%;
    font-weight: 700;
    font-size: 0.875rem;
    line-height: 1;
    border: none;
    color: $nxt-color-blue-highlight;
    background: none;
  }

  [disabled] .noUi-tooltip {
    color: $nxt-color-blue-light;
  }
}
</style>
