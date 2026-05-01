<template>
<div
  class="period-picker"
  :class="{ 'period-picker--single-row': onSingleRow }"
>
  <div class="nxt-form-column">
    <label for="from-date">
      From*
    </label>
    <input
      id="from-date"
      type="date"
      class="nxt-input"
      v-model="internalFrom"
      required
      :max="internalTo"
    />
  </div>
  <div class="nxt-form-column">
    <label for="to-date">
      To*
    </label>
    <input
      id="to-date"
      type="date"
      class="nxt-input"
      v-model="internalTo"
      required
      :max="toMax"
    />
  </div>
</div>
</template>

<script>
import { computed, onMounted } from 'vue';
import dayjs from 'dayjs';

export default {
  props: {
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    max: {
      type: String,
      validator(value) {
        const validValues = [ 'yesterday', 'today' ];
        return validValues.includes(value);
      },
    },
    onSingleRow: {
      type: Boolean,
      default: false,
    },
  },

  emits: [ 'change', 'update:from', 'update:to' ],

  setup(props, ctx) {
    const internalFrom = computed({
      get() {
        return props.from;
      },
      set(val) {
        ctx.emit('update:from', val);
        ctx.emit('change');
      },
    });
    const internalTo = computed({
      get() {
        return props.to;
      },
      set(val) {
        ctx.emit('update:to', val);
        ctx.emit('change');
      },
    });

    // Set default values
    const presets = {
      today: dayjs(),
      yesterday: dayjs().subtract(1, 'day'),
    };

    const setInitialValues = () => {
      if(props.to && props.from) return;
      // If nothing specified we set `to` to today or yesterday
      const preset = presets[props.max ?? 'today'];
      internalTo.value = preset.format('YYYY-MM-DD');
      // and `from` 29 days back for a total period of 30 days
      internalFrom.value = preset.subtract(29, 'day').format('YYYY-MM-DD');
    };

    onMounted(setInitialValues);

    return {
      internalFrom,
      internalTo,
      toMax: presets[props.max]?.format('YYYY-MM-DD'),
    };
  },
};
</script>

<style lang="scss">
.period-picker {
  display: flex;
  flex-direction: column;
  column-gap: 1rem;
  row-gap: 16px;

  &--single-row {
    flex-direction: row;

    &>div {
      width: calc(50% - 8px);
    }
  }
}
</style>
