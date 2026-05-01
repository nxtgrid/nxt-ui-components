<template>
<template v-if="!hideMe">
  <th
    :tabindex="column.sortable ? 0 : undefined"
    class="nxt-column-header"
    :class="{
      'nxt-column-header--sortable': column.sortable,
      'with-keyboard-focus-tight': column.sortable,
      'nxt-column-header--active': isSortActive,
    }"
    v-on="column.sortable ? { click: doSort, keydown: onKeyDown } : {}"
  >
    <div class="nxt-column-header__content">
      <span>{{ column.header }}</span>
      <mdi-icon
        v-if="column.sortable"
        class="nxt-column-header__icon"
        :scale="isMobileInterface ? 20 : 24"
        :icon="!isSortActive ? mdiSort : variables.order === 'asc' ? mdiSortAscending : mdiSortDescending"
      />

      <div
        v-if="column.filterOptions"
        class="nxt-column-header__filter pull-right"
        :class="{ 'nxt-column-header__filter--active': isFilterActive }"
      >
        <nxt-popover placement="bottom">
          <template #trigger="{ uid, togglePopover }">
            <nxt-button
              :id="uid"
              title="Adjust filter"
              variant="primary"
              :size="isMobileInterface ? 'small' : 'default'"
              :icon-svg="mdiFilterOutline"
              icon-only
              @click.stop="togglePopover"
            />
          </template>
          <template #default="{ closePopover }">
            <nxt-select
              v-if="column.filterOptions.type === 'select'"
              v-model="filterModel"
              :options="column.filterOptions.options"
              :placeholder="column.filterOptions.placeholder"
            />
            <input
              v-if="column.filterOptions.type === 'text'"
              type="text"
              class="nxt-input"
              v-model="filterModel"
              :placeholder="column.filterOptions.placeholder"
            />
            <input
              v-if="column.filterOptions.type === 'number'"
              type="number"
              class="nxt-input"
              v-model="filterModel"
              step="100"
              min="0"
              :placeholder="column.filterOptions.placeholder"
            />
            <div class="flex-horizontal mt-1">
              <nxt-button
                size="tiny"
                @click="[ onFilterClear(), closePopover() ]"
                :disabled="disableButtons"
              >
                Clear
              </nxt-button>
              <nxt-button
                size="tiny"
                variant="primary"
                class="pull-right"
                @click="[ onFilterApply(), closePopover() ]"
                :disabled="disableButtons"
              >
                Apply
              </nxt-button>
            </div>
          </template>
        </nxt-popover>
      </div>
    </div>
  </th>
</template>
</template>

<script>
import { assoc, dissoc, isNil, isNotNil } from 'ramda';
import { computed, ref } from 'vue';
import { mdiSort, mdiSortAscending, mdiSortDescending, mdiFilterOutline } from '@mdi/js';
import NxtPopover from '../NxtPopover/NxtPopover.vue';
import NxtSelect from '../form/NxtSelect.vue';

export default {
  props: {
    column: {
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
    isMobileInterface: {
      type: Boolean,
      default: false,
    },
    stacked: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const hideMe = computed(() =>
      props.stacked && props.isMobileInterface && !props.column.sortable && !props.column.filterOptions);

    const sortFieldToUse = props.column.sortField ?? props.column.field;

    const isSortActive = computed(() =>
      props.variables.sort === sortFieldToUse);

    const doSort = () => {
      if(!isSortActive.value) props.updateFn({
        sort: sortFieldToUse,
        order: 'asc',
      });
      else if(props.variables.order === 'asc') props.updateFn({
        order: 'desc',
      });
      else props.updateFn({ sort: null, order: null });
    };

    const onKeyDown = event => {
      if ((event.code === 'Enter' || event.code === 'NumpadEnter' || event.code === 'Space') && event.currentTarget.nodeName === 'TH') {
        doSort();
        event.preventDefault();
      }
    };

    const filterModel = ref(props.variables.filters[props.column.filterOptions?.field]);
    const isFilterActive = computed(() => isNotNil(props.variables.filters[props.column.filterOptions.field]));

    const onFilterClear = () => {
      filterModel.value = undefined;
      if(isFilterActive.value) {
        props.updateFn({
          offset: 0,
          filters: dissoc(props.column.filterOptions.field, props.variables.filters),
        });
      }
    };

    const onFilterApply = () => {
      props.updateFn({
        offset: 0,
        filters: assoc(props.column.filterOptions.field, filterModel.value, props.variables.filters),
      });
    };

    const disableButtons = computed(() => isNil(filterModel.value));

    return {
      hideMe,
      isSortActive,
      doSort,
      onKeyDown,
      filterModel,
      isFilterActive,
      onFilterClear,
      onFilterApply,
      disableButtons,
      mdiSort,
      mdiSortAscending,
      mdiSortDescending,
      mdiFilterOutline,
    };
  },

  components: { NxtPopover, NxtSelect },
};
</script>

<style lang="scss">
.nxt-column-header {
  padding: 0.5rem 16px;
  border-radius: 2px;
  text-align: left;
  font-weight: 700;
  color: rgba($nxt-color-font-dark, 0.75); // @TODO :: Make without opacity

  &__content {
    display: flex;
    align-items: center;
  }

  &__icon {
    flex-shrink: 0;
    margin-block: -2px;
    margin-left: 8px;
  }

  &__filter {
    .nxt-icon-btn {
      color: rgba($nxt-color-font-dark, 0.75);
      background-color: $nxt-color-blue-bright;
      border-radius: 100%;
      margin-left: 16px;

      @media (hover: hover) {
        &:hover {
          color: $nxt-color-blue-bright;
          background-color: $nxt-color-blue-highlight;
        }
      }

      @media(max-width: ($table-break - 1)) {
        margin-left: 4px;
      }
    }

    &--active {
      .nxt-icon-btn {
        color: $nxt-color-blue-bright;
        background-color: $nxt-color-blue-highlight;
      }
    }
  }

  &--sortable {
    cursor: pointer;

    @media (hover: hover) {
      &:hover {
        background: rgba($nxt-color-font-dark, 0.04);
      }
    }
  }

  &--active {
    color: $nxt-color-blue-highlight;
  }
}
</style>
