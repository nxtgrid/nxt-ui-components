<template>
<div class="uptime-wrapper">
  <p class="uptime-label">
    {{ name }}
    <span
      v-if="hasData"
      :class="`uptime-label--${ inferColor(totalHours) }`"
    >
      {{ totalHours }}h
    </span>
    <template v-else-if="!isLoading">
      | No data
    </template>
  </p>
  <div class="uptime">
    <uptime-indicator
      v-for="({ value, time }) in uptimesToHours"
      :key="time"
      :hours="value"
      :color="inferColor(value)"
      :date="time"
    />
  </div>
</div>
</template>

<script>
import UptimeIndicator from './UptimeIndicator.vue';
const betweenFactory = x => (min, max) => x >= min && x <= max;
const average = arr => arr.length ? arr.reduce((a,b) => a + b, 0) / arr.length : 0;

export default {
  props: {
    name: {
      type: String,
      required: true,
    },

    uptimes: {
      type: Array,
      required: true,
    },

    isLoading: {
      type: Boolean,
    },

    bottomMediumRange: {
      type: Number,
      required: true,
    },

    bottomPositiveRange: {
      type: Number,
      required: true,
    },
  },

  methods: {
    inferColor(hours) {
      if(hours === null) return 'gray';
      const between = betweenFactory(hours);

      if(between(this.bottomPositiveRange, 24)) {
        return 'green';
      }
      if(between(this.bottomMediumRange, this.bottomPositiveRange)) {
        return 'orange';
      }
      if(between(0, this.bottomMediumRange)) {
        return 'red';
      }
    },
  },

  computed: {
    hasData() {
      return this.uptimes?.some(({ value }) => value !== null);
    },

    uptimesToHours() {
      if(this.isLoading) {
        return new Array(30).fill({ value: null, time: null });
      }
      return this.uptimes.map(({ value, time }) => ({
        value: value === null ? null : Math.round(value * 240) / 10,
        time,
      }));
    },

    totalHours() {
      const hoursAverage = average(this.uptimesToHours
        .filter(({ value }) => value !== null)
        .map(({ value }) => value),
      );

      return Math.round(hoursAverage * 10) / 10;
    },
  },

  components: { UptimeIndicator },
};
</script>

<style lang="scss">
.uptime-wrapper {
  width: 100%;
}

.uptime-label {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
  font-weight: 700;
  color: $nxt-color-blue;

  &--green,
  &--lightgreen {
    color: $nxt-color-success;
  }
  &--orange {
    color: $nxt-color-warn;
  }
  &--red {
    color: $nxt-color-error;
  }
}

.uptime {
  display: flex;
  align-items: center;
  height: 40px;
  margin-inline: -1px;
}
</style>
