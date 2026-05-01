<template>
<button
  v-if="isSupported"
  type="button"
  class="click-to-copy with-any-focus-padded"
  :class="{ 'click-to-copy--bordered': hasBorder }"
  @click="copy(source)"
>
  <mdi-icon :icon="mdiContentCopy" :scale="16" />
  <span v-if="copied" class="click-to-copy__copied">{{ feedback }}</span>
</button>
</template>

<script>
import { useClipboard } from '@vueuse/core';
import { mdiContentCopy } from '@mdi/js';

export default {
  props: {
    source: {
      type: [ String, Number ],
      required: true,
    },

    hasBorder: {
      type: Boolean,
      default: true,
    },

    feedback: {
      type: String,
      default: 'Copied!',
    },
  },

  setup(props) {
    const { isSupported, copy, copied } = useClipboard(props.source);

    return { mdiContentCopy, isSupported, copy, copied };
  },
};
</script>

<style lang="scss">
.click-to-copy {
  position: relative;
  background: none;
  border: 0;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1;

  &--bordered {
    border: thin solid $nxt-color-blue-light;
  }

  @media (hover: hover) {
    &:hover {
      background-color: $nxt-color-background-light;
      border-color: $nxt-color-blue-highlight;
    }
  }

  &__copied {
    position: absolute;
    display: block;
    width: max-content;
    padding: 4px 8px;
    border-radius: 4px;
    bottom: calc(100% + 6px);
    font-size: 14px;
    font-weight: 700;
    color: $nxt-color-blue-highlight;
    background-color: rgba($nxt-color-white, 0.9);
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
