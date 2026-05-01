<template>
<component
  :is="computedComponent"
  class="with-any-focus-padded"
  :class="computedClasses"
  v-bind="computedProps"
  v-wave
>
  <Transition name="fade-simple-quick">
    <mdi-icon
      v-if="isLoading"
      :icon="mdiLoading"
      class="nxt-loading-indicator rotating"
    />
  </Transition>
  <span
    class="nxt-inner-btn"
    :class="{ 'nxt-inner-btn--loading': isLoading }"
  >
    <mdi-icon
      v-if="iconName || iconSvg"
      :name="iconName"
      :icon="iconSvg"
      :scale="size === 'tiny' ? 16 : size === 'small' ? 20 : 24"
      :class="[ iconOnly ? '' : [ 'nxt-btn__icon nxt-btn__icon--left'] ]"
    />
    <slot v-if="!iconOnly" />
    <mdi-icon
      v-if="iconRightName"
      :name="iconRightName"
      :scale="size === 'tiny' ? 16 : size ==='small' ? 20 : 24"
      class="nxt-btn__icon nxt-btn__icon--right"
    />
  </span>
</component>
</template>

<script>
import { mdiLoading } from '@mdi/js';

export default {
  props: {
    size: {
      type: String,
      default: 'default',
    },

    variant: {
      type: String,
      default: 'secondary',
    },

    to: {
      type: [ String, Object ],
    },

    href: {
      type: String,
    },

    iconName: {
      type: String,
    },

    iconSvg: {
      type: String,
    },

    iconOnly: {
      type: Boolean,
      default: false,
    },

    iconRightName: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    isLoading: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    mdiLoading,
  }),

  computed: {
    computedComponent() {
      return this.to ? 'router-link' : this.href ? 'a' : 'button';
    },

    computedClasses() {
      const { iconOnly, variant, size, isActive } = this;

      if(iconOnly) return [
        'nxt-icon-btn',
        `nxt-icon-btn--${ variant }`,
        size !== 'default' && `nxt-icon-btn--${ size }`,
      ].filter(Boolean);

      return [
        'nxt-btn',
        `nxt-btn--${ variant }`,
        size !== 'default' && `nxt-btn--${ size }`,
        isActive && 'is-active',
      ].filter(Boolean);
    },

    computedProps() {
      const _props = {};
      if(this.to) _props.to = this.to;
      else if(this.href) _props.href = this.href;
      return _props;
    },
  },
};
</script>

<style lang="scss">
@use 'sass:color';

.nxt-btn {
  position: relative;
  display: inline-flex;
  border: 0;
  background: 0;
  padding: 1rem 48px;
  line-height: 1;
  font-weight: 700;
  border-radius: 2px;
  text-decoration: none;
  white-space: nowrap;

  &--primary {
    color: $nxt-color-font-white;
    background-color: $nxt-color-blue;

    @media (hover: hover) {
      &:hover {
        background-color: color.adjust($nxt-color-blue, $lightness: 15%, $space: hsl);
      }
    }
  }

  &--secondary {
    color: inherit;
    background-color: $nxt-color-blue-light;

    @media (hover: hover) {
      &:hover {
        background-color: color.adjust($nxt-color-blue-light, $lightness: -5%, $space: hsl);
      }
    }
  }

  &--tertiary {
    color: inherit;
    border: thin solid $nxt-color-blue-light;

    @media (hover: hover) {
      &:hover {
        background-color: $nxt-color-background-light;
      }
    }
  }

  &--danger {
    color: $nxt-color-font-white;
    background-color: $nxt-color-error;

    @media (hover: hover) {
      &:hover {
        background-color: color.adjust($nxt-color-error, $lightness: 15%, $space: hsl);
      }
    }
  }

  &--small {
    padding: 0.625rem 24px;
  }

  &--tiny {
    font-size: 0.875rem;
    padding: 0.5rem 16px;
  }

  &__icon {
    // To offset icon size that is larger than text
    transform: translateY(3px);
    margin-top: -8px;

    .nxt-btn--small & {
      // To offset icon size that is larger than text
      transform: translateY(1px);
      margin-top: -4px;
    }

    &--left {
      margin-right: 4px;
    }

    &--right {
      margin-left: 4px;
      transition: 200ms $ease--out-expo;
    }
  }

  &.is-active .nxt-btn__icon--right {
    transform: rotate(180deg);
  }
}

.nxt-icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  border-radius: 4px;
  color: inherit;

  &--secondary {
    background-color: $nxt-color-white;
    border: thin solid $nxt-color-blue-light;
  }

  &--tertiary {
    background-color: $nxt-color-blue-light;
  }

  &--white {
    color: $nxt-color-white;
  }

  &--small,
  &--tiny {
    width: 24px;
    height: 24px;
  }

  @media (hover: hover) {
    &:hover {
      background-color: $nxt-color-background-light;
    }

    &--secondary:hover {
      border-color: $nxt-color-blue-highlight;
    }

    &--white:hover {
      background-color: $nxt-color-placeholder;
    }
  }
}

.nxt-inner-btn {
  display: flex;
  opacity: 1;
  transition: opacity 200ms ease-out;

  &--loading {
    opacity: 0.15;
  }
}

.nxt-loading-indicator {
  position: absolute;
  top: calc(50% - 12px);
  left: calc(50% - 12px);
}
</style>
