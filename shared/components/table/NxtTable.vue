<template>
<div v-if="title" class="nxt-table-header">
  <header class="nxt-table-header__header">
    <h2 class="nxt-table-header__title">{{ title }}</h2>
    <p class="nxt-table-header__count">
      {{ totalRecords }}<template v-if="recordsPostfix">{{ recordsPostfix }}</template>
    </p>
    <div
      v-if="$slots.header"
      class="nxt-table-header__slotted"
    >
      <slot name="header" :doDownload="download"></slot>
    </div>
  </header>
  <div class="nxt-table-header__actions">
    <nxt-table-search
      v-if="withSearch"
      class="nxt-table-header__search"
      :variables="variables"
      :update-fn="doUpdateVariables"
      :disabled="!firstFetchHappened"
    />
  </div>
</div>
<!-- <nxt-paginator
  v-if="isMobileInterface"
  :variables="variables"
  :update-fn="doUpdateVariables"
  :total-records="totalRecords"
  class="top-paginator"
/> -->
<div
  class="nxt-table-wrapper"
  :class="{ 'nxt-table-skeleton': !firstFetchHappened }"
>
  <loading-bar
    v-if="loading || dataLoading || hasError"
    :has-error="hasError"
    class="nxt-table-loading-bar"
    :class="`nxt-table-loading-bar--${ variant }`"
  />
  <nxt-table-tabs
    v-if="tabs"
    :tabs="tabs"
    :variables="variables"
    :update-fn="doUpdateVariables"
    :disabled="!firstFetchHappened"
  />
  <div
    class="nxt-table-scroller"
    :class="{ 'nxt-table-stacked': stacked && isMobileInterface }"
  >
    <table
      class="nxt-table"
      :class="`nxt-table--${ variant }`"
    >
      <thead class="nxt-table-head">
        <scroll-horizontal :el="scrollableRow">
          <tr
            ref="scrollableRow"
            class="nxt-table-head__row"
          >
            <nxt-column-header
              v-for="column in columnsWithoutEmpties"
              :key="column.header"
              :column="column"
              :variables="variables"
              :update-fn="doUpdateVariables"
              :is-mobile-interface="isMobileInterface"
              :stacked="stacked"
            />
          </tr>
        </scroll-horizontal>
      </thead>
      <tbody
        class="nxt-table-body"
        :class="{ 'nxt-table-body--has-row-click': firstFetchHappened && (!!rowLinkGenerator || !!onRowClick) }"
      >
        <template v-if="totalRecords > 0">
          <tr
            v-for="entry in entries"
            class="nxt-table-body__row"
            :class="{ 'nxt-table-body__row--disabled': disableRowIf?.(entry) }"
            :key="entry.id"
            v-on="!!onRowClick ? { click: () => { onRowClick(entry) } } : {}"
          >
            <td
              v-for="column in columnsWithoutEmpties"
              :key="`${ entry.id }-${ column.header }-${ column.field }`"
              class="nxt-table-body__cell"
              :class="{ 'nxt-table-body__cell--elevated': column.hasEdit || column.elevated || (!!rowLinkGenerator && (!!column.createLink || !!column.onClick)) }"
              :style="column.style"
            >
              <span
                v-if="isMobileInterface"
                class="nxt-table-body__cell-header"
              >
                {{ column.header }}
              </span>

              <template v-if="column.hasEdit">
                <nxt-button
                  v-if="column.allowEdit ? column.allowEdit(entry) : true"
                  title="Edit"
                  variant="primary"
                  size="small"
                  :icon-name="column.editIcon"
                  :icon-svg="column.editIcon ? undefined : mdiPencilOutline "
                  icon-only
                  @click="onEditClick(entry)"
                />
              </template>
              <conditional-cell-wrapper
                v-else
                :to="column.createLink?.(entry)"
              >
                <component
                  v-if="column.component"
                  :is="tableCellMap[column.component]"
                  :data="entry"
                  :field="column.field"
                  :settings="column"
                />
                <template v-else>
                  {{ path(column.field.split('.'), entry) }}
                </template>
              </conditional-cell-wrapper>
            </td>
            <router-link
              class="nxt-table-body__row-link"
              v-if="!IS_SAFARI && !!rowLinkGenerator"
              :to="rowLinkGenerator(entry)"
            />
          </tr>
        </template>
        <tr
          v-else-if="firstFetchHappened"
          class="nxt-table-body__row"
        >
          <td
            class="nxt-table-body__cell"
            :colspan="columns.length"
          >
            No records found
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="n in Math.min(variables.limit, 25)"
            :key="n"
            class="nxt-table-body__row"
          >
            <td
              v-for="(_c, i) in columns"
              :key="i"
              class="nxt-table-body__cell"
            >&nbsp;</td>
            <div v-if="!IS_SAFARI" class="nxt-table-body__skeleton scc scc-overlay"></div>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</div>

<slot name="custom-paginator">
  <nxt-paginator
    v-if="pagination"
    :variables="variables"
    :update-fn="doUpdateVariables"
    :total-records="totalRecords"
    :max-pages="isMobileInterface ? 3 : 5"
    :is-loading="!firstFetchHappened"
  />
</slot>
</template>

<script>
import { path, allPass, isNotNil, isNotEmpty } from 'ramda';
import { inject, onBeforeUnmount, ref, watch, computed } from 'vue';
import { watchOnce } from '@vueuse/core';
import { useTableVariables } from './lib/use-table-variables';
import { useTableData } from './lib/use-table-data';
import { mdiPencilOutline } from '@mdi/js';

import NxtColumnHeader from './NxtColumnHeader.vue';
import NxtPaginator from './NxtPaginator.vue';
import NxtTableTabs from './NxtTableTabs.vue';
import NxtTableSearch from './NxtTableSearch.vue';
import ScrollHorizontal from '../ScrollHorizontal/ScrollHorizontal.vue';
import LoadingBar from '../LoadingBar/LoadingBar.vue';
import ConditionalCellWrapper from './ConditionalCellWrapper.vue';

const isNotNilOrEmpty = allPass([ isNotNil, isNotEmpty ]);
const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export default {
  props: {
    title: {
      type: String,
    },
    recordsPostfix: {
      type: String,
    },
    columns: {
      type: Array,
      required: true,
    },
    initialVariables: {
      type: Object,
    },
    hiddenFilters: {
      type: Object,
    },
    tabs: {
      type: Object,
    },

    provider: {
      type: String,
      default: 'supabase-rest',
    },
    dataEntries: {
      type: Array,
    },
    dataLoading: {
      type: Boolean,
    },
    // gqlQuery: {
    //   type: Object,
    // },
    pgRestOptions: {
      type: Object,
    },

    variant: {
      type: String,
      default: 'standalone',
    },
    rowLinkGenerator: {
      type: Function,
    },
    onRowClick: {
      type: Function,
    },
    stacked: {
      type: Boolean,
      default: true,
    },
    pagination: {
      type: Boolean,
      default: true,
    },
    onEditClick: {
      type: Function,
    },
    disableRowIf: {
      type: Function,
    },
    doPolling: {
      type: Object,
    },
  },

  emits: [ 'first-fetch' ],

  setup(props, ctx) {
    const tableCellMap = inject('tableCellMap');
    const { variables, doUpdateVariables } = useTableVariables(props.initialVariables);
    const { loading, entries, hasError, totalRecords, download, reload, updateEntries } =
      useTableData(props.provider, {
        getEntries: () => props.dataEntries,
        // gqlQuery: props.gqlQuery,
        pgRestOptions: props.pgRestOptions,
        hiddenFilters: props.hiddenFilters,
      }, variables);

    // We need loading to change only once to know a data-fetch has happened
    const firstFetchHappened = ref(false);
    watchOnce(loading, () => {
      firstFetchHappened.value = true;
      ctx.emit('first-fetch');
    });

    // If we have raw entries, we need to refresh table when data changes from the outside
    if(props.dataEntries) watch(() => props.dataEntries, reload);

    // We filter out columns with a 'hideWhen' clause or when they're empty
    const columnsWithoutEmpties = computed(() => props.columns.filter(({ field, /* filterOptions, */ hideWhen, hideWhenAllNil }) => {
      if(!field || /* filterOptions || */ !entries.value?.length) return true;
      if(hideWhen) return !hideWhen(entries.value, variables.value);
      if(hideWhenAllNil) return entries.value.some(entry => field
        // We demark the possibility to look in multiple fields
        // by a '|' sign. Following that, we look for values
        // traversing the path which is combined with '.'s.
        // So "directive.kwh|lorawan_directive.kwh" would look
        // for values in both the kwh column in the directives table
        // and the kwh column in the lorawan_directives table.
        // The column is hidden when ALL values are nil or empty
        .split('|')
        .map(field => isNotNilOrEmpty(path(field.split('.'), entry)))
        .some(val => val === true))
      ;
      return true;
    }));

    const withSearch = props.pgRestOptions?.searchPaths?.length;


    /**
     * Responsiveness
    **/

    const isMobileInterface = ref(true);

    const setInterfaceType = mql => {
      isMobileInterface.value = mql.matches;
    };

    const mql = window.matchMedia('(max-width: 639px)');
    mql.addEventListener('change', setInterfaceType);
    setInterfaceType(mql);

    const scrollableRow = ref();


    /**
     * Polling
    **/

    let pollInterval;
    let isPolling = false;

    const startPolling = () => {
      if(isPolling) return;
      isPolling = true;

      pollInterval = setInterval(() => {
        if(!props.doPolling.while(entries)) {
          clearInterval(pollInterval);
          isPolling = false;
        }
        else reload();
      }, props.doPolling.interval);
    };

    if(props.doPolling) startPolling();


    /**
     * Cleanup
    **/

    onBeforeUnmount(() => {
      mql.removeEventListener('change', setInterfaceType);
      clearInterval(pollInterval);
    });

    return {
      tableCellMap,
      path,
      loading,
      entries,
      hasError,
      totalRecords,
      variables,
      doUpdateVariables,
      download,
      refresh(options) {
        reload();
        if(options?.withPolling) startPolling();
      },
      updateTableValues: updateEntries,

      firstFetchHappened,
      columnsWithoutEmpties,
      withSearch,
      isMobileInterface,
      scrollableRow,
      mdiPencilOutline,
      IS_SAFARI,
    };
  },

  components: { NxtColumnHeader, NxtPaginator, NxtTableTabs, NxtTableSearch, ScrollHorizontal, LoadingBar, ConditionalCellWrapper },
};
</script>

<style lang="scss">
.nxt-table-header {
  &__header {
    display: flex;
    align-items: center;
    flex-grow: 1;
    flex-wrap: wrap;
    row-gap: 0.5rem;
  }

  &__title {
    font-size: 20px;
    line-height: 1.2;
    color: $nxt-color-blue;
    font-weight: 700;
  }

  &__count {
    background-color: $nxt-color-blue-dark;
    color: $nxt-color-font-white;
    line-height: 1;
    padding: 0.25rem 8px;
    border-radius: 1.5rem;
    margin-left: 8px;
    font-size: .875rem;
    font-weight: 700;
  }

  &__slotted {
    display: flex;
    column-gap: 8px;
    margin-left: auto;
  }

  &__actions {
    display: grid;
    margin-top: 0.5rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 8px;
  }

  &__search {
    margin-bottom: 1rem;
  }

  @media(min-width: $table-break) {
    display: flex;
    align-items: center; // flex-end; ?
    padding-bottom: 1rem;
    // margin-bottom: 1rem;

    &__slotted {
      margin-right: 8px;
    }

    &__actions {
      display: block;
      margin-top: 0;
      margin-left: auto;
    }

    &__search {
      margin-bottom: 0;
    }

    &__sort {
      display: none;
    }
  }
}

.nxt-table-wrapper {
  position: relative;
}

.nxt-table-loading-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;

  &--in-card {
    top: -1rem;
    margin-top: -1px;
  }
}

.nxt-table-scroller:not(.nxt-table-stacked) {
  @include no-scrollbars;
  // Funny margins to avoid clipping of shadows or row background colors
  margin-left: -24px;
  padding-left: 24px;
  margin-right: -24px;
  padding-right: 24px;
  overflow-x: auto;
}

.nxt-table {
  min-width: 100%;
  table-layout: fixed;
  position: relative;

  @media(max-width: ($table-break - 1)) {
    font-size: 0.875rem;
    line-height: 1.125rem;
  }
}

.nxt-table-head {
  position: relative;
}

.nxt-table-body {
  &__row {
    position: relative;

    &--disabled {
      pointer-events: none;
      opacity: 0.6;
    }
  }

  &__row-link {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  &__cell {
    position: relative;
    padding: 1rem 16px;
    z-index: 1;

    &--elevated {
      z-index: 2;
    }

    @media(max-width: ($table-break - 1)) {
      padding: 0.75rem 12px;
    }
  }

  &__skeleton {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  &--has-row-click {
    .nxt-table-body__row {
      cursor: pointer;
    }
  }
}

.nxt-table--standalone {
  border-spacing: 0 0.5rem;
  border-top: thin solid $nxt-color-blue-light;

  .nxt-table-body__cell {
    background-color: $nxt-color-white;

    &:first-child {
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
    }

    &:last-child {
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
    }
  }

  .nxt-table-body__row--disabled .nxt-table-body__cell {
    background-color: $nxt-color-blue-light;
  }

  .nxt-table-body--has-row-click {
    .nxt-table-body__row {
      @media (hover: hover) {
        transition: 250ms $ease--out-expo;

        &:hover{
          transform: translateY(-2px);
          box-shadow: $sh2;
        }
      }
    }
  }
}

.nxt-table--in-card {
  border-collapse: collapse;

  .nxt-table-body__row {
    &::after {
      @include pseudo;
      top: 0;
      left: -$card-padding-inline-mobile;
      right: -$card-padding-inline-mobile;
      height: 100%;

      @media(min-width: $table-break) {
        left: -$card-padding-inline;
        right: -$card-padding-inline;
      }
    }

    &:nth-child(even)::after {
      background-color: $nxt-color-background-lightest;
    }

    &--disabled::after {
      background-color: $nxt-color-blue-light !important;
    }
  }

  .nxt-table-body__cell,
  .nxt-column-header {
    &:first-of-type {
      padding-left: 0;
    }

    &:last-of-type {
      padding-right: 0;
    }
  }

  .nxt-table-body--has-row-click {
    .nxt-table-body__row {
      @media (hover: hover) {
        &::after {
          transition: 250ms $ease--out-expo;
        }

        &:hover {
          &::after {
            background: $nxt-color-background-lighter;
          }
        }
      }
    }
  }
}

.nxt-table-stacked {
  .nxt-table {
    display: block;
  }

  .nxt-table-head {
    display: block;

    &__row {
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
      white-space: nowrap;
    }

    .nxt-column-header {
      min-height: 52px;

      &:not(:first-child) {
        padding-left: 8px;
      }

      &:not(:last-child) {
        padding-right: 8px;
      }

      &__content {
        height: 100%;
      }
    }
  }

  .nxt-table-body {
    display: block;

    &__row {
      display: block;
      padding-block: 0.75rem;
    }

    &__cell {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      padding: 0;

      &:not(:first-child) {
        padding-top: 0.5rem;
      }

      &:not(:last-of-type) {
        padding-bottom: 0.5rem;
        border-bottom: thin solid rgba($nxt-color-blue, 0.1) !important;
      }
    }

    &__cell-header {
      font-weight: 700;
    }
  }

  .nxt-table--standalone {
    .nxt-table-head {
      min-height: 1rem;
    }

    .nxt-table-body {
      &__row {
        background-color: $nxt-color-white;
        box-shadow: 0 0 1px #0000001a, 1px 1px 4px #00000026;
        padding-inline: 16px;
        border-radius: 2px;

        &:not(:last-child) {
          margin-bottom: 1rem;
        }
      }

      &__cell {
        background: none;
        border-radius: 0;
      }
    }
  }
}

.nxt-table-skeleton {
  thead {
    pointer-events: none;
    opacity: 0.5;
  }
  tr, td {
    background: none !important;
  }
}

// .top-paginator {
//   border-top: thin solid $nxt-color-blue-light;
// }
</style>
