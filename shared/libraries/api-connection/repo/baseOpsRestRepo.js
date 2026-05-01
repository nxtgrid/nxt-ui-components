import { useAccountStore } from '../store/account';
import { baseOpsRepo } from './baseOpsRepo';

export const baseOpsRestRepo = {
  fetcher: baseOpsRepo,

  unwrapError: async err => {
    if(!err.response) throw err;
    const serverError = await err.response.json();
    if(serverError.statusCode === 401) {
      console.warn('[SUPABASE AUTH] Going to log out from baseOps REST repo, after:', serverError);
      useAccountStore().doLogOut();
    }
    throw serverError;
  },

  getGrafanaToken() {
    return this.fetcher
      .get('auth/grafana-token')
      .json()
      .catch(this.unwrapError)
    ;
  },

  createOrder(json) {
    return this.fetcher
      .post('orders', { json })
      .json()
      .catch(this.unwrapError)
    ;
  },

  createFlutterwaveOrder(json) {
    return this.fetcher
      .post('orders/flutterwave/initialise', { json })
      .json()
      .catch(this.unwrapError)
    ;
  },

  verifyOrder(id) {
    return this.fetcher
      .post('orders/flutterwave/verify', { json: { id } })
      .json()
      .catch(this.unwrapError)
    ;
  },

  cancelOrder(json) {
    return this.fetcher
      .post('orders/flutterwave/cancel/public', { json })
      .json()
      .catch(this.unwrapError)
    ;
  },

  createMeterInteraction(json) {
    return this.fetcher
      .post('meter-interactions/create-one', { json })
      .json()
      .catch(this.unwrapError)
    ;
  },

  getMeterInteractionDeliveryStatus(id) {
    return this.fetcher
      .get(`meter-interactions/${ id }/delivery-status`)
      .json()
      .catch(this.unwrapError)
    ;
  },

  retryInteraction(id) {
    return this.fetcher
      .post('meter-interactions/retry', { json: { id } })
      .json()
      .catch(this.unwrapError)
    ;
  },

  saveTaskBatches(batches) {
    return this.fetcher
      .post('directive-batches/upsert-many', {
        json: batches,
      })
      .json()
      .catch(this.unwrapError)
    ;
  },

  getGridUptime(gridId) {
    return this.fetcher
      .get(`data-analytics/grid/${ gridId }/uptimes`)
      .json()
      .catch(this.unwrapError)
    ;
  },

  /**
   * Admin
   */

  inviteMember(json) {
    return this.fetcher
      .post('user-admin/invite-member', { json })
      .json()
      .catch(this.unwrapError)
    ;
  },

  updateMember(json) {
    return this.fetcher
      .post('user-admin/update-member', { json })
      .json()
      .catch(this.unwrapError)
    ;
  },

  createAgent(json) {
    return this.fetcher
      .post('user-admin/create-agent', { json })
      .json()
      .catch(this.unwrapError)
    ;
  },

  updateAgent(json) {
    return this.fetcher
      .post('user-admin/update-agent', { json })
      .json()
      .catch(this.unwrapError)
    ;
  },

  createCustomer(json) {
    return this.fetcher
      .post('user-admin/create-customer', { json })
      .json()
      .catch(this.unwrapError)
    ;
  },

  updateCustomer(json) {
    return this.fetcher
      .post('user-admin/update-customer', { json })
      .json()
      .catch(this.unwrapError)
    ;
  },

  deleteAccount({ id, type }) {
    return this.fetcher
      .delete(`user-admin/${ type }/${ id }`)
      .json()
      .catch(this.unwrapError)
    ;
  },
};
