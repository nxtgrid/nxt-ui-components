<template>
<nxt-popover placement="bottom-end" @close="onPanelClose">
  <template #trigger="{ uid, togglePopover }">
    <nxt-button
      :id="uid"
      size="small"
      variant="tertiary"
      @click="togglePopover"
    >
      {{ currentLabel }}
    </nxt-button>
  </template>
  <template #default="{ closePopover }">
    <div class="period-picker-dialog">
      <div class="period-picker-dialog__left">
        <p class="period-picker-dialog__title">Quick ranges</p>
        <ul class="period-picker-dialog__list">
          <li
            v-for="option in quickOptions"
            :key="option.label"
          >
            <button
              class="period-picker-dialog__button"
              @click="[ setRange(option), closePopover() ]"
            >
              {{ option.label }}
            </button>
          </li>
        </ul>
      </div>
      <form @submit.prevent="[ emitRange(), closePopover() ]" class="period-picker-dialog__right">
        <p class="period-picker-dialog__title">Custom</p>
        <period-picker
          class="period-picker-dialog__custom mb-1"
          v-model:from="range.from"
          v-model:to="range.to"
          :max="max"
          @change="setCustomLabel"
        />
        <div style="display: flex">
          <nxt-button
            type="submit"
            class="pull-right"
            size="small"
            variant="primary"
            :disabled="!hasCustomChanges"
          >
            Apply
          </nxt-button>
        </div>
      </form>
    </div>
  </template>
</nxt-popover>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import dayjs from 'dayjs';
import { useGlobalStore } from '@nxt/nxt-vue';

import NxtPopover from '@nxt/components/NxtPopover/NxtPopover.vue';
import PeriodPicker from './PeriodPicker.vue';
import { periodToUnixTimestamps } from '@nxt/libraries/period-formatters';

// @TOCHECK :: Could be we need more fine-grained control, with time included
// For example, some data (gateway/router uptime) is recorded by the minute, so
// we could potentially simply check from current time back 30 days.

export default {
  props: {
    initial: {
      type: [ String, Object ],
      required: true,
    },
    max: {
      type: String,
      validator(value) {
        const validValues = [ 'yesterday', 'today' ];
        return validValues.includes(value);
      },
    },
    emitInUnixTimestamp: {
      type: Boolean,
      default: true,
    },
  },

  emits: [ 'pick' ],

  setup(props, ctx) {
    const timezone = useGlobalStore().timezone;

    const range = reactive({
      from: undefined,
      to: undefined,
    });
    const currentLabel = ref();

    // This is for internal comparison to see if we have custom changes
    const _lastEmittedRange = reactive({
      from: undefined,
      to: undefined,
    });
    const hasCustomChanges = computed(() => {
      return range.from !== _lastEmittedRange.from || range.to !== _lastEmittedRange.to;
    });

    const quickOptions = [
      {
        label: 'Last 2 days',
        subtrValue: 1,
        subtrUnit: 'days',
      },
      {
        label: 'Last 7 days',
        subtrValue: 6,
        subtrUnit: 'days',
      },
      {
        label: 'Last 30 days',
        subtrValue: 29,
        subtrUnit: 'days',
      },
      {
        label: 'Last 90 days',
        subtrValue: 89,
        subtrUnit: 'days',
      },
      {
        label: 'Last 6 months',
        subtrValue: 6,
        subtrUnit: 'months',
      },
      {
        label: 'Last year',
        subtrValue: 1,
        subtrUnit: 'year',
      },
    ];

    const emitRange = () => {
      // Set internal value for diff checking
      _lastEmittedRange.from = range.from;
      _lastEmittedRange.to = range.to;

      if(props.emitInUnixTimestamp) ctx.emit('pick', periodToUnixTimestamps(timezone)(range));
      else ctx.emit('pick', range);
    };

    const setRange = ({ addToNowValue, addToNowUnit, subtrValue, subtrUnit, label }) => {
      let _toDate = dayjs();
      if(props.max === 'yesterday') {
        _toDate = _toDate.subtract(1, 'day');
      }
      else if(addToNowValue && addToNowUnit) {
        _toDate = _toDate.add(addToNowValue, addToNowUnit);
      }
      const _fromDate = _toDate.subtract(subtrValue, subtrUnit);

      // We need to convert to simple string so it can be used by datepicker
      // (and yes that means reconverting before emitting)
      range.to = _toDate.format('YYYY-MM-DD');
      range.from = _fromDate.format('YYYY-MM-DD');
      if(label) currentLabel.value = label;
      else setCustomLabel();

      emitRange();
    };

    const setCustomLabel = () => {
      currentLabel.value = range.from + ' to ' + range.to;
    };

    const onPanelClose = () => {
      // Probably preferred to reset but too much work currently
      if(hasCustomChanges.value) emitRange();
    };

    if(typeof props.initial === 'string')
      setRange(quickOptions.find(({ label }) => label === props.initial));
    else setRange(props.initial);

    return { range, currentLabel, quickOptions, emitRange, hasCustomChanges, setRange, setCustomLabel, onPanelClose };
  },

  components: { NxtPopover, PeriodPicker },
};
</script>

<style lang="scss">
.period-picker-dialog {
  display: flex;

  &__title {
    font-weight: 100;
    font-size: 1.25rem;
    line-height: 1;
    margin-bottom: 1rem;
  }

  &__right {
   border-left: thin solid $nxt-color-blue-light;
   padding-left: 16px;
   margin-left: 16px;
  }

  &__list {
    list-style: none outside none;
    padding: 0;

    @media(min-width: $table-break) {
      column-count: 2;
      column-gap: 16px;
    }

    li:not(:first-child) {
      margin-top: 1rem;
    }
  }

  &__button {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;

    @media (hover: hover) {
      &:hover {
        color: $nxt-color-blue-highlight;
      }
    }
  }

  &__custom {
    width: 180px;
  }
}
</style>
