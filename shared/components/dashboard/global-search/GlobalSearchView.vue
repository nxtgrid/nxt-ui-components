<template>
<div v-if="result">
  <scroll-horizontal :el="tableTabsEl">
    <div ref="tableTabsEl" class="nxt-table-tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="nxt-table-tabs__button with-keyboard-focus-inset"
        :class="{ 'is-active': tab === activeTab }"
        @click="activeTab = tab"
      >
        {{ `${ tab } (${ result[tab].count })` }}
      </button>
    </div>
  </scroll-horizontal>

  <nxt-table
    provider="raw-data"
    :data-entries="result[activeTab].entries"
    :data-loading="loading"
    :columns="columns[activeTab]"
    :row-link-generator="createLink"
  >
    <template #custom-paginator>
      <nxt-paginator
        :variables="queryParams"
        :update-fn="onPaginate"
        :total-records="result[activeTab].count"
      />
    </template>
  </nxt-table>
</div>
<p v-else>No search results</p>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useGlobalSearchStore } from './global-search';
import { storeToRefs } from 'pinia';
import { createSearchEntryRoutePath, findEntityWithEntries } from './_helpers';

import NxtTable from '@nxt/components/table/NxtTable.vue';
import NxtPaginator from '@nxt/components/table/NxtPaginator.vue';
import ScrollHorizontal from '@nxt/components/ScrollHorizontal/ScrollHorizontal.vue';

export default {
  setup() {
    const tableTabsEl = ref();
    const searchStore = useGlobalSearchStore();
    const { result, queryParams, loading } = storeToRefs(searchStore);
    const tabs = ref([]);
    const activeTab = computed({
      get() {
        return searchStore.activeTab;
      },
      set(newTab) {
        searchStore.setActiveTab(newTab);
      },
    });

    watch(result, (newResult, oldResult) => {
      if(!newResult) return;

      // Set tab to first tab on first entry
      if(!oldResult) {
        tabs.value = Object.keys(newResult);
        activeTab.value = tabs.value[0];
      }

      const resultOfCurrentTab = newResult[activeTab.value];
      if(resultOfCurrentTab.count > 0) return;
      const firstTabWithResult = findEntityWithEntries(newResult);
      if(firstTabWithResult) activeTab.value = firstTabWithResult;
    }, { immediate: true });

    const onPaginate = searchStore.setQueryParams;

    const createLink = data => createSearchEntryRoutePath(activeTab.value, data);

    const columns = {
      meters: [
        {
          field: 'external_reference',
          header: 'Meter number',
        },
        {
          field: 'full_name',
          header: 'Customer',
        },
        {
          field: 'grid.name',
          header: 'Grid',
        },
      ],
      grids: [
        {
          field: 'name',
          header: 'Name',
        },
      ],
      agents: [
        {
          field: 'full_name',
          header: 'Name',
        },
        {
          field: 'grid.name',
          header: 'Grid',
        },
        {
          field: 'wallet.balance',
          header: 'Balance',
        },
      ],
      customers: [
        {
          field: 'full_name',
          header: 'Name',
        },
        {
          field: 'meter',
          header: 'Meter',
        },
        {
          field: 'grid.name',
          header: 'Grid',
        },
      ],
    };

    return {
      tableTabsEl,
      tabs,
      activeTab,
      queryParams,
      result,
      loading,
      onPaginate,
      createLink,
      columns,
    };
  },

  components: { NxtTable, NxtPaginator, ScrollHorizontal },
};
</script>

<style lang="scss" scoped>
.nxt-table-tabs__button {
  text-transform: capitalize;
}
</style>
