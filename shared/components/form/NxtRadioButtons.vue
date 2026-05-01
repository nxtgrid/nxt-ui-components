<template>
<div
  class="nxt-radio-buttons"
  :class="{ 'as-single-button': asSingleButton }"
>
  <label
    class="nxt-radio-button"
    v-for="(option, index) in options"
    :key="index"
  >
    <input
      type="radio"
      :name="$.uid"
      class="visually-hidden nxt-radio-button__input"
      :value="useObject ? option[optionValue] : option"
      v-model="internalModelValue"
      :required="required"
    />
    <span v-if="!asSingleButton" class="nxt-radio-button__replacer"></span>
    {{ useObject ? option[optionLabel] : option }}
  </label>
</div>
</template>

<script>
import { computed } from 'vue';
import { isObject } from '../../libraries/type-helpers';

export default {
  props: {
    modelValue: {
      type: [ String, Number, Boolean ],
    },
    options: {
      type: Array,
      required: true,
    },
    optionValue: {
      type: String,
      default: 'value',
    },
    optionLabel: {
      type: String,
      default: 'label',
    },
    asSingleButton: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
    },
  },

  emits: [ 'update:modelValue' ],

  setup(props, ctx) {
    const useObject = props.options.every(isObject);
    // const allValues = props.options
    //   .map(option => useObject ? option[props.optionValue] : option);

    const internalModelValue = computed({
      get: () => props.modelValue,
      set(val) {
        ctx.emit('update:modelValue', val);
      },
    });

    return { useObject, internalModelValue };
  },
};
</script>

<style lang="scss">
@use 'sass:color';

.nxt-radio-buttons {
  display: flex;
  align-items: center;

  &:not(.as-single-button) {
    column-gap: 24px;
  }
}

.nxt-radio-button {
  display: flex;
  align-items: center;
  column-gap: 8px;
  cursor: pointer;

  &__input {
    bottom: 0;
    left: 12px;
  }

  &__replacer {
    position: relative;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    border: thin solid $nxt-color-blue-light;

    &::after {
      @include pseudo;
      background-color: $nxt-color-blue-lighter;
      height: 14px;
      width: 14px;
      left: 4px;
      border-radius: 7px;
      top: 50%;
      margin-top: -7px;
      transform: scale(.1);
      opacity: 0;
      transition: transform .15s ease-out, opacity 0s linear .15s;
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
      &::after {
        transform: scale(1);
        opacity: 1;
        transition: transform .15s ease-out, opacity 0s;
      }
    }
  }

  .as-single-button & {
    border: thin solid $nxt-color-blue-light;
    color: $nxt-color-blue-lighter;
    line-height: 1.125;
    padding: 0.5rem 16px;

    &:not(:last-child) {
      border-right: 0 none;
    }

    &:first-of-type {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }

    &:last-of-type {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    &:has(> input:not([disabled]):not(:checked):hover) {
      border-color: $nxt-color-blue-highlight;
    }

    &:has(> input:not([disabled]):focus) {
      outline: 0 none;
      outline-offset: 0;
      box-shadow: 0 0 0 0.2rem $nxt-color-blue-focusring;
      border-color: $nxt-color-blue-highlight;
    }

    &:has(> input:checked) {
      background-color: $nxt-color-blue;
      border-color: $nxt-color-blue;
      color: $nxt-color-font-white;

      &:hover {
        background: color.adjust($nxt-color-blue, $lightness: 15%, $space: hsl);
        border-color: color.adjust($nxt-color-blue, $lightness: 15%, $space: hsl);
      }
    }
  }
}
</style>
