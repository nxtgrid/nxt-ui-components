<template>
<div class="nxt-select-wrapper">
  <select
    :id="id"
    :name="name"
    :required="required"
    :disabled="disabled"
    class="nxt-input nxt-select__select"
    :class="{ 'nxt-select__select--with-clear': showClear }"
    v-model="internalValue"
  >
    <option v-if="placeholder" disabled>
      {{ placeholder }}
    </option>
    <option
      v-for="option in options"
      :key="useObject ? option[optionValue] : option"
      :value="useObject ? option[optionValue] : option"
    >
      {{ useObject ? option[optionLabel] : option }}
    </option>
  </select>
  <span
    v-if="showPlaceholder"
    class="nxt-select__placeholder"
  >
    {{ placeholder }}
  </span>
  <mdi-icon
    class="nxt-select__arrow"
    :icon="mdiMenuDown"
  />
  <button
    v-if="showClear && modelValue"
    type="button"
    class="nxt-select__clear"
    @click="$emit('update:modelValue', undefined)"
  >
    <mdi-icon :icon="mdiClose" />
  </button>
</div>
</template>

<script>
import { computed } from 'vue';
import { mdiMenuDown, mdiClose } from '@mdi/js';
import { isObject } from '../../libraries/type-helpers';

export default {
  props: {
    id: {
      type: String,
    },
    name: {
      type: String,
    },
    required: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
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
    placeholder: {
      type: String,
    },
    showClear: {
      type: Boolean,
      default: false,
    },
  },

  emits: [ 'update:modelValue' ],

  setup(props, ctx) {
    const useObject = computed(() => props.options.every(isObject));

    const internalValue = computed({
      get: () => props.modelValue,
      set(val) {
        ctx.emit('update:modelValue', val);
      },
    });

    const showPlaceholder = computed(() => {
      if(!props.placeholder) return false;
      return !props.options
        .some(option => (useObject.value ? option[props.optionValue] : option) === props.modelValue);
    });

    return { mdiMenuDown, mdiClose, useObject, internalValue, showPlaceholder };
  },
};
</script>

<style lang="scss">
@use 'sass:color';

// @TEMPORARY NAMING DUE TO COLLISSION WITH SPHINX (using styles in _form.scss)
.nxt-select-wrapper {
  position: relative;
}

.nxt-select {
  &__select {
    -webkit-appearance: none;
    appearance: none;
    padding-right: 36px !important;
    cursor: pointer;

    &--with-clear {
      padding-right: 56px !important;
    }
  }

  &__arrow {
    position: absolute;
    right: 4px;
    top: calc(50% - 12px);
    color: $nxt-color-blue-lighter;
    pointer-events: none;
  }

  &__clear {
    position: absolute;
    display: flex;
    padding: 0;
    border: 0;
    background: 0;
    right: 28px;
    top: calc(50% - 12px);
    border-radius: 4px;
    color: $nxt-color-placeholder;
    transition: 200ms ease-out;
    cursor: pointer;

    @media (hover: hover) {
      &:hover {
        color: inherit;
        background-color: color.adjust($nxt-color-blue-light, $lightness: 15%, $space: hsl);
      }
    }
  }

  &__placeholder {
    @include clamp(1);

    position: absolute;
    left: 16px;
    right: 36px;
    top: 50%;
    transform: translateY(-50%);
    color: $nxt-color-placeholder;
    pointer-events: none;

    .nxt-select__select--with-clear + & {
      right: 56px;
    }
  }
}
</style>
