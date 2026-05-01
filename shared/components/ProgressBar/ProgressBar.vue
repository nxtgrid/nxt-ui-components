<template>
<div
  class="progress-bar"
  :class="{ 'progress-bar--has-subbar': hasSubPercentage }"
>
  <div
    class="progress-bar__progress"
    :class="{ 'progress-bar--with-transition': useCssTransition }"
    :style="`width: ${ percentage }%;`"
  ></div>
  <div
    v-if="hasSubPercentage"
    class="progress-bar__sub-progress"
    :class="{ 'progress-bar--with-transition': useCssTransition }"
    :style="`width: ${ subPercentage }%;`"
  ></div>
</div>
</template>

<script>
import { isNil } from 'ramda';
export default {
  props: {
    percentage: {
      type: Number,
      required: true,
    },
    subPercentage: {
      type: Number,
    },
    useCssTransition: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    hasSubPercentage() {
      return !isNil(this.subPercentage);
    },
  },
};
</script>

<style lang="scss">
.progress-bar {
  position: relative;
  width: 100%;
  height: 6px;
  background-color: $nxt-color-blue-light;
  border-radius: 3px;
  overflow: hidden;

  &--has-subbar {
    height: 8px;
    border-radius: 4px;
  }

  &--with-transition {
    transition: width 400ms $ease--out-expo;
  }

  &__progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 6px;
    max-width: 100%;
    background-color: $nxt-color-blue-highlight;
  }

  &__sub-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    max-width: 100%;
    background-color: $nxt-color-warn;
  }
}
</style>
