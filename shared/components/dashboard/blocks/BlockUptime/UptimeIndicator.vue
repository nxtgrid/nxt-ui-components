<template>
<div
  ref="size-target"
  class="uptime-indicator"
  :class="`uptime-indicator--${ color }`"
  @mouseover="onMouseover"
  @mouseleave="onMouseleave"
>
  <div
    v-if="date !== null && showTooltip"
    class="uptime-tooltip"
  >
    <p class="uptime-tooltip__date">{{ displayDate }}</p>
    <p v-if="hours !== null">{{ hours }}h</p>
    <p v-else >No data</p>
  </div>
</div>
</template>

<script>
import { useGlobalStore } from '@nxt/nxt-vue';

export default {
  props: {
    hours: {
      type: [ Number, null ],
      required: true,
    },
    date: {
      type: [ String, null ],
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    showTooltip: false,
  }),

  methods: {
    onMouseover() {
      const $el = this.$refs['size-target'];
      $el.classList.add('uptime-indicator--large');
      $el.previousSibling?.classList?.add('uptime-indicator--medium');
      $el.nextSibling?.classList?.add('uptime-indicator--medium');
      this.showTooltip = true;
    },
    onMouseleave() {
      const $el = this.$refs['size-target'];
      $el.classList.remove('uptime-indicator--large');
      $el.previousSibling?.classList?.remove('uptime-indicator--medium');
      $el.nextSibling?.classList?.remove('uptime-indicator--medium');
      this.showTooltip = false;
    },
  },

  computed: {
    displayDate() {
      return new Date(this.date).toLocaleDateString(undefined, {
        timeZone: useGlobalStore().timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
};
</script>

<style lang="scss">
.uptime-indicator {
  position: relative;
  flex: 1 1 0px;
  height: 40px;
  transition: 100ms ease-out;

  &::after {
    position: absolute;
    top: 0;
    left: 10%;
    content: '';
    width: 80%;
    height: 100%;
    border-radius: 20px;
  }

  &--green::after {
    background: $nxt-color-success;
  }
  &--lightgreen::after {
    background: rgba($nxt-color-success, .5);
  }
  &--orange::after {
    background: rgba($nxt-color-warn, .5);
  }
  &--red::after {
    background: rgba($nxt-color-error, .5);
  }
  &--gray::after {
    background: rgba($nxt-color-placeholder, .5);
  }

  @media (hover: hover) {
    &--medium {
      height: 44px;
      padding-inline: 2px;
      transition: 200ms ease-out;
    }

    &--large {
      height: 48px;
      padding-inline: 4px;
    }
  }
}

.uptime-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  color: $nxt-color-font-white;
  background-color: $nxt-color-blue-dark;
  padding: 0.5rem 8px;
  text-align: center;
  z-index: $z-raised;

  &::after {
    @include css-triangle($nxt-color-blue-dark, down);
    bottom: -6px;
    left: calc(50% - 6px);
  }

  &__date {
    opacity: 0.5;
    white-space: nowrap;
    font-size: 12px;
    margin-bottom: 0.25rem;
  }
}
</style>
