<template>
<nav class="nxt-paginator">
  <template v-if="!isLoading">
    <template v-if="totalRecords > 0">
      <button
        class="nxt-paginator__button nxt-paginator__arrow with-any-focus-tight"
        title="To first page"
        :disabled="variables.offset === 0"
        @click="updateFn({ offset: 0 })"
      >
        <mdi-icon :scale="20" :icon="mdiChevronDoubleLeft" />
      </button>
      <button
        class="nxt-paginator__button nxt-paginator__arrow with-any-focus-tight"
        :disabled="variables.offset === 0"
        @click="updateFn({ offset: variables.offset - variables.limit })"
      >
        <mdi-icon :scale="20" :icon="mdiChevronLeft" />
      </button>

      <button
        v-for="page in pagesToShow"
        :key="page"
        class="nxt-paginator__button nxt-paginator__page with-any-focus-tight"
        :disabled="((page - 1) * variables.limit) === variables.offset"
        @click="updateFn({ offset: (page - 1) * variables.limit })"
      >
        {{ page }}
      </button>

      <button
        class="nxt-paginator__button nxt-paginator__arrow with-any-focus-tight"
        :disabled="((numPages - 1) * variables.limit) === variables.offset"
        @click="updateFn({ offset: variables.offset + variables.limit })"
      >
        <mdi-icon :scale="20" :icon="mdiChevronRight" />
      </button>
      <button
        class="nxt-paginator__button nxt-paginator__arrow with-any-focus-tight"
        :disabled="((numPages - 1) * variables.limit) === variables.offset"
        @click="updateFn({ offset: (numPages - 1) * variables.limit })"
      >
        <mdi-icon :scale="20" :icon="mdiChevronDoubleRight" />
      </button>
    </template>
  </template>
  <div v-else class="nxt-paginator__skeleton scc scc-simple"></div>

  <nxt-select
    class="nxt-paginator__select"
    name="paginator-number-of-rows"
    :model-value="variables.limit"
    @update:modelValue="val => updateFn({ limit: val, offset: 0 })"
    :options="tablePreferencesStore.numRowsOptions"
    option-value="value"
    option-label="label"
    :disabled="isLoading"
  />
</nav>
</template>

<script>
import { computed } from 'vue';
import { watchOnce } from '@vueuse/core';
import NxtSelect from '../form/NxtSelect.vue';
import { mdiChevronLeft, mdiChevronRight, mdiChevronDoubleLeft, mdiChevronDoubleRight } from '@mdi/js';
import { useTablePreferencesStore } from '.';
import { range } from 'ramda';

export default {
  props: {
    variables: {
      type: Object,
      required: true,
    },
    updateFn: {
      type: Function,
      required: true,
    },
    totalRecords: {
      type: Number,
      default: 0,
    },
    maxPages: {
      type: Number,
      default: 5,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },

  emits: [ 'change' ],

  setup(props) {
    const tablePreferencesStore = useTablePreferencesStore();
    const numPages = computed(() => {
      if(props.variables.limit === null) return 1;
      if(props.totalRecords === 0) return 1;
      return Math.ceil(props.totalRecords / props.variables.limit);
    });
    const currentPage = computed(() =>{
      if(props.variables.limit === null) return 1;
      return 1 + (props.variables.offset / props.variables.limit);
    });

    // If somehow on load (by external variables) the current page is out of range, reset it to 0
    watchOnce(() => props.isLoading, () => {
      if(currentPage.value > numPages.value)
        props.updateFn({ offset: 0 });
    });

    const pagesToShow = computed(() => {
      // Case where have few pages
      if(numPages.value <= props.maxPages) return numPages.value;

      const distance = Math.ceil(props.maxPages / 2);

      // Case where we're at the beginning of the array;
      if(currentPage.value <= distance) return props.maxPages;

      // Case where we're at the end of the array
      if((numPages.value - currentPage.value) < distance) {
        const excludedUpper = numPages.value + 1;
        return range(excludedUpper - props.maxPages, excludedUpper);
      }

      // Case where we're somewhere in the middle of the array
      const lower = currentPage.value - Math.floor(props.maxPages / 2);
      return range(lower, lower + props.maxPages);
    });

    return { tablePreferencesStore, numPages, pagesToShow, mdiChevronLeft, mdiChevronRight, mdiChevronDoubleLeft, mdiChevronDoubleRight };
  },

  components: { NxtSelect },
};
</script>

<style lang="scss">
.nxt-paginator {
  display: flex;
  color: $nxt-color-blue;
  align-items: center;
  // padding-inline: 4px;
  flex-wrap: nowrap !important;
  padding-top: 0.5rem;

  &__button {
    display: flex;
    justify-content: center;
    align-items: center;
    background: none;
    border: none;
    border-radius: 2px;
    padding: 0;
    width: 32px;
    height: 32px;
    flex-shrink: 0;

    @media (hover: hover) {
      &:not([disabled]):hover {
        background: $nxt-color-background-light;
      }
    }
  }

  &__arrow:disabled {
    cursor: default !important;
  }

  &__page:disabled {
    background-color: #d8efff;
    cursor: default !important;
    opacity: 1 !important;
  }

  &__select {
    margin-left: auto;
    flex-shrink: 0;

    select {
      background: none;
      border: none;
      text-align: right;
    }
  }

  &__skeleton {
    height: 32px;
    width: 288px;
    box-shadow: $sh1;
  }

  @media(max-width: ($table-break - 1)) {
    padding-top: 1rem;
    font-size: 0.875rem;
    line-height: 1.125rem !important;

    &__skeleton {
      width: 224px;
    }
  }
}
</style>
