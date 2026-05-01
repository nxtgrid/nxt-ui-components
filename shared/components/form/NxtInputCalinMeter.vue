<template>
<div class="nxt-calin-meter-input">
  <div class="eleven-squares">
    <div
      class="eleven-squares__square"
      v-for="(_, index) in fields"
      :key="index"
    >
      <input
        ref="inputRefs"
        :disabled="index < 2"
        class="nxt-input"
        :class="{ 'nxt-input--error': displayValidation && error }"
        type="text"
        :value="fields[index]"
        inputmode="numeric"
        maxlength="1"
        min="0"
        autocomplete="calin-meter-number"
        @input="onInput($event.target.value, index)"
        @keyup="onKeyup($event, index)"
        @focus="onFocus"
        @paste="onPaste"
      />
    </div>
  </div>
  <p
    v-if="displayValidation && error"
    class="nxt-calin-meter-input__error"
  >
    {{ error }}
  </p>
</div>
</template>

<script>
import { /*  onMounted, */ ref, computed, watch } from 'vue';
import { METER_NUMBER_LENGTH, validateCalinMeterNumber } from '@nxt/libraries/validators';
const MANDATORY_FIRST_TWO = '47';

export default {
  props: {
    modelValue: {
      type: String,
    },
    isValid: {
      type: Boolean,
      default: false,
    },
  },

  emits: [ 'update:modelValue', 'update:isValid' ],

  setup(props, ctx) {
    const inputRefs = ref();
    const _initialFields = props.modelValue ? props.modelValue.split('') : [ ...MANDATORY_FIRST_TWO.split(''), ...Array(METER_NUMBER_LENGTH - 2).fill('') ];
    const fields = ref(_initialFields);
    const meterNumber = computed(() => fields.value.join(''));
    const displayValidation = ref(false);

    const onInput = (value, index) => {
      // Update value no matter what to ensure reactive changes are triggered
      fields.value[index] = value;
      // The maxlength attribute doesn't work for the number type input, so the text type is used.
      // The following logic somewhat simulates the behavior of a number input.
      // If a member types a 'wrong' entry, the value will be reset to an empty string.
      if (/[^0-9]/g.test(value)) {
        fields.value[index] = '';
        return;
      }

      if(index === 10) displayValidation.value = true;

      // If there's a value entered, jump to next index
      if(value && index < 10) {
        inputRefs.value[index + 1].focus();
      }
    };

    const onKeyup = (evt, index) => {
      if (![
        'ArrowLeft',
        'ArrowRight',
        'Backspace',
      ].includes(evt.key)) return;

      evt.preventDefault();
      let $el;

      if(evt.key === 'ArrowLeft') {
        if(index === 2) $el = inputRefs.value[10];
        else $el = inputRefs.value[ index - 1 ];
      }
      if(evt.key === 'ArrowRight') {
        if(index === 10) $el = inputRefs.value[2];
        else $el = inputRefs.value[ index + 1 ];
      }
      if(evt.key === 'Backspace') {
        if(index > 2) $el = inputRefs.value[ index - 1 ];
      }

      requestAnimationFrame(() => {
        $el?.focus();
      });
    };

    const onFocus = ({ target }) => {
      target.select();
    };

    const onPaste = evt => {
      evt.preventDefault();

      const pasted = evt.clipboardData.getData('text');
      if(!pasted.length || isNaN(pasted)) return;

      const firstTwo = pasted.slice(0, 2);
      const pastedArray = pasted.split('');

      const toPaste = firstTwo === MANDATORY_FIRST_TWO ?
        pastedArray.slice(0, METER_NUMBER_LENGTH) :
        [ ...MANDATORY_FIRST_TWO.split(''), ...pastedArray.slice(0, METER_NUMBER_LENGTH - 2) ]
      ;

      const numPasted = toPaste.length;
      const focusIndex = numPasted === METER_NUMBER_LENGTH ? (METER_NUMBER_LENGTH - 1) : numPasted;

      fields.value = [ ...toPaste, ...Array(METER_NUMBER_LENGTH - numPasted).fill('') ];
      inputRefs.value[focusIndex].focus();
    };

    // @TODO :: This may be handy if we want HTML5 validation
    // onMounted(() => {
    //   inputRefs.value[2].setCustomValidity('Invalid field.');
    // });

    const error = computed(() => validateCalinMeterNumber(meterNumber.value));

    watch(meterNumber, val => {
      ctx.emit('update:modelValue', val);
    }, { immediate: true });

    watch(error, val => {
      ctx.emit('update:isValid', !val);
    }, { immediate: true });

    return { inputRefs, fields, meterNumber, onInput, onKeyup, onFocus, onPaste, error, displayValidation };
  },
};
</script>

<style lang="scss">
.eleven-squares {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 1%;

  &__square {
    aspect-ratio: 1/ 1;
  }
}

.nxt-calin-meter-input {
  position: relative;
  padding-bottom: 2rem;

  .nxt-input {
    width: 100%;
    height: 100%;
    padding: 0;
    text-align: center;
  }

  &__error {
    position: absolute;
    top: calc(100% - 1.625rem);
    width: 100%;
    font-size: 0.875rem;
    color: $nxt-color-error;
  }
}
</style>
