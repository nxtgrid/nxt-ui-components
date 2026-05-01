<template>
<div
  class="loading-bar"
  :class="{ 'loading-bar--error': hasError }"
></div>
</template>

<script>
export default {
  props: {
    hasError: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss">
.loading-bar {
  position: relative;
  height: 2px;
  background-color: $nxt-color-blue-light;
  overflow: hidden;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: auto;
    width: auto;
    height: inherit;
    background-color: $nxt-color-blue;
    will-change: left, right;
    animation-duration: 2.2s;
    animation-iteration-count: infinite;
  }

  &::before {
    animation-name: indeterminate;
  }

  &::after {
    animation-name: indeterminate-short;
  }

  &--error {
    &::before,
    &::after {
      background-color: $nxt-color-error;
    }
  }
}

@keyframes indeterminate {
  0% {
      left: -90%;
      right: 100%;
  }
  60% {
      left: -90%;
      right: 100%;
  }
  100% {
      left: 100%;
      right: -35%;
  }
}
@keyframes indeterminate-short {
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
      left: 107%;
      right: -8%;
  }
  100% {
      left: 107%;
      right: -8%;
  }
}
</style>
