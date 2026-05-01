<template>
<div class="nxt-table-tabs-wrapper">
  <scroll-horizontal :el="scrollableDiv">
    <div
      ref="scrollableDiv"
      class="nxt-table-tabs"
      :class="{ 'nxt-table-tabs--disabled': disabled }"
    >
      <button
        v-for="tab in tabs.options"
        :key="tab.value"
        class="nxt-table-tabs__button with-keyboard-focus-inset"
        :class="{ 'is-active': variables.filters[tabs.field] === tab.value }"
        @click="onTabChange(tabs.field, tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </scroll-horizontal>
</div>
</template>

<script>
import { ref } from 'vue';
import ScrollHorizontal from '../ScrollHorizontal/ScrollHorizontal.vue';

export default {
  props: {
    tabs: {
      type: Object,
      required: true,
    },
    variables: {
      type: Object,
      required: true,
    },
    updateFn: {
      type: Function,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const scrollableDiv = ref();

    const onTabChange = (field, value) => {
      props.updateFn({ offset: 0, filters: { ...props.variables.filters, [field]: value } });
    };

    return { scrollableDiv, onTabChange };
  },

  components: { ScrollHorizontal },
};
</script>

<style lang="scss">
.nxt-table-tabs-wrapper {
  padding-top: 1rem;
  border-top: thin solid $nxt-color-blue-light;

  @media(max-width: ($table-break - 1)) {
    padding-top: 0.5rem;
  }
}

.nxt-table-tabs {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;

  &--disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &__button {
    position: relative;
    scroll-snap-align: start;
    background: 0;
    border: 0;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    padding: 0.5rem 16px;
    color: $nxt-color-placeholder;
    cursor: pointer;
    white-space: nowrap;

    &::after {
      @include pseudo;
      height: 3px;
      width: 100%;
      bottom: 0;
      left: 0;
      background-color: $nxt-color-placeholder;
      z-index: 1;

      transform-origin: right center;
      transform-style: preserve-3d;
      transform: scaleX(0);
      transition: transform 400ms $ease--out-expo;
    }

    @media (hover: hover) {
      &:hover {
        &::after {
          transform-origin: left center;
          transform: scaleX(1);
        }
      }
    }

    &.is-active {
      color: inherit;

      &::after {
        transform: scaleX(1);
        background-color: $nxt-color-blue-highlight;
      }
    }

    &:active {
      transform: none;
    }
  }

  @media(max-width: ($table-break - 1)) {
    font-size: 0.875rem;
    line-height: 1.125rem;
  }
}
</style>
