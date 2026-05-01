<template>
<div class="nxt-checkbox-wrapper">
  <label class="nxt-checkbox">
    <input
      :disabled="disabled"
      type="checkbox"
      class="visually-hidden"
      :checked="isChecked"
      @change="onChange"
    />
    <span class="nxt-checkbox__replacer"></span>
    {{ label }}
  </label>
</div>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    disabled: {
      type: Boolean,
    },
    modelValue: {
      type: Boolean,
    },
    label: {
      type: String,
    },
    trueValue: {
      type: null,
      default: true,
    },
    falseValue: {
      type: null,
      default: false,
    },
  },

  emits: [ 'update:modelValue' ],

  setup(props, ctx) {
    const isChecked = computed(() => props.modelValue === props.trueValue);

    const onChange = () => {
      const newModelValue = isChecked.value ? props.falseValue : props.trueValue;
      ctx.emit('update:modelValue', newModelValue);
    };

    return { isChecked, onChange };
  },
};
</script>

<style lang="scss">
.nxt-checkbox-wrapper {
  display: flex;
}

.nxt-checkbox {
  display: flex;
  align-items: center;
  column-gap: 8px;
  cursor: pointer;

  &__replacer {
    position: relative;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 2px;
    border: thin solid $nxt-color-blue-light;

    &::before,
    &::after {
      @include pseudo;
      width: 4px;
      background-color: $nxt-color-blue-lighter;
      transform-origin: left top;
      opacity: 0;
      transition: height 0s linear .15s,
                  opacity .15s ease-out;
    }

    &::before {
      height: 0;
      left: 1.5px;
      top: 12px;
      transform: rotate(-45deg);
    }

    &::after {
      height: 0;
      left: 8.5px;
      top: 19px;
      transform: rotate(-135deg);
    }

    input:not([disabled]):hover + & {
      border-color: $nxt-color-blue-highlight;
    }

    input:not([disabled]):focus + & {
      outline: 0 none;
      outline-offset: 0;
      box-shadow: 0 0 0 0.2rem $nxt-color-blue-focusring;
      border-color: $nxt-color-blue-highlight;
    }

    input:checked + & {
      &::before,
      &::after {
        opacity: 1;
      }

      &::before {
        height: 7px;
        transition: height .1s ease-out;
      }

      &::after {
        height: 17px;
        transition: height .2s ease-in .05s;
      }
    }
  }
}
</style>
