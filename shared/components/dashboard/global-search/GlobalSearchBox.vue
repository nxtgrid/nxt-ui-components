<template>
<form @submit.prevent="runNewSearch" class="global-search-box">
  <div class="nxt-input-with-icon">
    <input
      type="text"
      name="global-search"
      class="nxt-input"
      placeholder="Search..."
      v-model="searchValue"
      :disabled="loading"
    />
    <mdi-icon
      v-if="loading"
      :icon="mdiLoading"
      class="rotating"
    />
    <mdi-icon
      v-else
      :icon="mdiMagnify"
    />
  </div>
</form>
</template>

<script>
import { mdiLoading, mdiMagnify } from '@mdi/js';
import { computed, watch } from 'vue';
import { useGlobalSearchStore } from './global-search';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { storeToRefs } from 'pinia';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { createILikeOrString } from '@nxt/libraries/supabase-helpers';
import { createSearchEntryRoutePath, findEntityWithEntries } from './_helpers';
import { reject, isNil } from 'ramda';

const handleSearchResponse = ({ data, error, count }) => {
  if(error) throw error;
  return { entries: data, count };
};

export default {
  props: {
    useCustomersWithMeters: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const router = useRouter();
    const accountStore = useAccountStore();
    const toast = useToast();
    const searchStore = useGlobalSearchStore();
    const { activeTab, queryParams, loading } = storeToRefs(searchStore);

    const searchValue = computed({
      get() {
        return searchStore.searchValue;
      },
      set(newVal) {
        searchStore.setSearchValue(newVal);
      },
    });

    const routeToSingleResult = searchResult => {
      const entity = findEntityWithEntries(searchResult);
      const entry = searchResult[entity].entries[0];
      const path = createSearchEntryRoutePath(entity, entry);
      router.push(path);
    };

    const validateQueryLength = query => {
      if(query.length < 3) {
        toast.warning('Please enter at least 3 characters');
        return false;
      }
      return true;
    };

    const runSearch = async () => {
      searchStore.setLoading(true);

      const _searchResult = {
        meters: undefined,
        grids: undefined,
        agents: undefined,
        customers: undefined,
      };
      let _grandTotal = 0;
      const _promises = [];

      // Meters
      if(!props.useCustomersWithMeters) {
        const _query = baseSupabaseRepo.client
          .from('meters_with_account_and_statuses')
          .select(`
            id,
            external_reference,
            full_name,
            grid:grid_id!inner (id, name, organization_id)
          `, { count: 'exact' })
          .is('deleted_at', null)
          .or(createILikeOrString([ 'full_name', 'external_reference' ], queryParams.value.search))
        ;

        if(accountStore.myOrgIdForFiltering)
          _query.eq('grid.organization_id', accountStore.myOrgIdForFiltering);

        if(activeTab.value === 'meters')
          _query.range(queryParams.value.offset, queryParams.value.offset + (queryParams.value.limit - 1));
        else _query.limit(queryParams.value.limit);

        _promises.push(_query
          .then(handleSearchResponse)
          .then(_meters => {
            _searchResult.meters = _meters;
            _grandTotal += _meters.count;
          }))
        ;
      }

      // Grids
      {
        const _query = baseSupabaseRepo.client
          .from('grids')
          .select('id, name', { count: 'exact' })
          .is('deleted_at', null)
          .ilike('name', `%${ queryParams.value.search }%`)
        ;

        if(accountStore.myOrgIdForFiltering)
          _query.eq('organization_id', accountStore.myOrgIdForFiltering);

        if(activeTab.value === 'grids')
          _query.range(queryParams.value.offset, queryParams.value.offset + (queryParams.value.limit - 1));
        else _query.limit(queryParams.value.limit);

        _promises.push(_query
          .then(handleSearchResponse)
          .then(_grids => {
            _searchResult.grids = _grids;
            _grandTotal += _grids.count;
          }))
        ;
      }

      // Agents
      {
        const _query = baseSupabaseRepo.client
          .from('agents_with_account')
          .select(`
            id,
            full_name,
            grid:grid_id!inner (id, name, organization_id),
            wallet:wallets (balance)
          `, { count: 'exact' })
          .is('deleted_at', null)
          .ilike('full_name', `%${ queryParams.value.search }%`)
        ;

        if(accountStore.myOrgIdForFiltering)
          _query.eq('grid.organization_id', accountStore.myOrgIdForFiltering);

        if(activeTab.value === 'agents')
          _query.range(queryParams.value.offset, queryParams.value.offset + (queryParams.value.limit - 1));
        else _query.limit(queryParams.value.limit);

        _promises.push(_query
          .then(handleSearchResponse)
          .then(_agents => {
            _searchResult.agents = _agents;
            _grandTotal += _agents.count;
          }))
        ;
      }

      // Customers
      {
        const _query = baseSupabaseRepo.client
          .from('customers_with_account')
          .select(`
            id,
            full_name,
            meter,
            grid:grid_id!inner (id, name, organization_id)
          `, { count: 'exact' })
          .is('deleted_at', null)
        ;

        props.useCustomersWithMeters
          ? _query.or(createILikeOrString([ 'full_name', 'meter' ], queryParams.value.search))
          : _query.ilike('full_name', `%${ queryParams.value.search }%`);

        if(accountStore.myOrgIdForFiltering)
          _query.eq('grid.organization_id', accountStore.myOrgIdForFiltering);

        if(activeTab.value === 'customers')
          _query.range(queryParams.value.offset, queryParams.value.offset + (queryParams.value.limit - 1));
        else _query.limit(queryParams.value.limit);

        _promises.push(_query
          .then(handleSearchResponse)
          .then(_customers => {
            _searchResult.customers = _customers;
            _grandTotal += _customers.count;
          }))
        ;
      }

      try {
        await Promise.all(_promises);
        // We always set the search result even when 0 or 1 results,
        // because a user can stay on or route to the search page and
        // get unexpected results otherwise
        const searchResult = reject(isNil, _searchResult);
        searchStore.setResult(searchResult);

        if(_grandTotal === 1) {
          routeToSingleResult(searchResult);
          return;
        }

        if(_grandTotal === 0) {
          toast.warning('No results for this search query');
          return;
        }

        router.push('/search/');
      }
      catch(err) {
        const title = 'Search error';
        console.error(title, err);
        toast.error(`${ title }: ${ err.message }`);
      }
      finally {
        searchStore.setLoading(false);
      }
    };

    // For a new search from the input, validate first
    const runNewSearch = () => {
      const isValid = validateQueryLength(searchValue.value);
      if(isValid) {
        searchStore.setQueryParams({
          search: searchStore.searchValue,
          offset: 0,
        });
      }
    };

    // Trigger a search whenever queryparams change
    watch(queryParams, runSearch);

    return { searchValue, loading, runNewSearch, mdiLoading, mdiMagnify };
  },
};
</script>

<style lang="scss">
.global-search-box {
  max-width: 280px;
}
</style>
