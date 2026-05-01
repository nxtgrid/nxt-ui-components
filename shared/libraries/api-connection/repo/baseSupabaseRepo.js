import { createClient } from '@supabase/supabase-js';
import { useAccountStore } from '../store/account';

import { authRepo } from './supaSubRepos/authRepo';
import { agentsRepo } from './supaSubRepos/agentsRepo';

const { VITE_SUPABASE_REFERENCE_ID, VITE_SUPABASE_ANON_KEY } = import.meta.env;
export const SUPABASE_URL = VITE_SUPABASE_REFERENCE_ID === 'local' ? 'http://127.0.0.1:54321' : `https://${ VITE_SUPABASE_REFERENCE_ID }.supabase.co`;

export const _client = createClient(SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
  realtime: { worker: true },
});

_client.auth.onAuthStateChange((event, session) => {
  // When doing PW recovery we don't store the token yet
  if(event === 'PASSWORD_RECOVERY') return;
  const accountStore = useAccountStore();
  // On any other event we do store/update the token..
  if(session?.user) accountStore.logInUser(session.user);
  // ..unless there's no token in which case we clean all account data
  else {
    accountStore.$reset();
  }
});

export const baseSupabaseRepo = {
  client: _client,

  handleResponse: ({ data, error, count }) => {
    if(error) throw error;
    if(count) return { data, count };
    return data;
  },

  ...authRepo,
  ...agentsRepo,

  async createOrganization({ name, formal_name, email }) {
    const [ { id } ] = await this.client
      .from('organizations')
      .insert({ name, formal_name, email })
      .select('id')
      .then(baseSupabaseRepo.handleResponse)
    ;
    await this.client
      .from('wallets')
      .insert({ organization_id: id })
      .then(baseSupabaseRepo.handleResponse)
    ;
    return { id };
  },

  getGridMeta(gridId) {
    return this.client
      .from('grids')
      .select(`
        id,
        name,
        is_generation_managed_by_nxt_grid,
        feature_access_config,
        generation_external_gateway_id,
        generation_external_site_id,
        timezone,
        walkthrough_external_id,
        uses_dual_meter_setup,
        monthly_rental,
        organization_id
      `)
      .eq('id', gridId)
      .maybeSingle()
      .then(this.handleResponse)
    ;
  },
};
