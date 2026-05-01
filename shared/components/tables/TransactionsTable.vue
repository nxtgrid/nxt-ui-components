<template>
<nxt-table
  v-if="!staticLimit || !!staticData"
  ref="ordersTable"
  :title="!staticLimit ? 'Transactions' : undefined"
  :provider="!!staticLimit ? 'raw-data' : 'supabase-rest'"
  :pagination="!staticLimit"
  :variant="!!staticLimit ? 'in-card' : undefined"
  :data-entries="staticData"
  :columns="columns"
  :pg-rest-options="pgRestOptions"
  :on-row-click="openOrderDetailsModal"
  :initial-variables="!staticLimit ? {
    sort: 'updated_at',
    order: 'desc',
  } : undefined"
  :hidden-filters="{
    or: funkyOrString,
  }"
/>
</template>
<script>
import { onBeforeUnmount, ref } from 'vue';
import OrderDetailsModal from '../modals/OrderDetailsModal/OrderDetailsModal.vue';
import { useNxtModal } from '../NxtModal/';

import NxtTable from '../table/NxtTable.vue';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { useRealtime } from '@nxt/libraries/api-connection/composables/useRealtime';

export default {
  props: {
    organization_id: {
      type: Number,
    },
    agent_id: {
      type: Number,
    },
    showReference: {
      type: Boolean,
      default: false,
    },
    staticLimit: {
      type: Number,
      default: null,
    },
  },

  setup(props) {
    const nxtModal = useNxtModal();
    const ordersTable = ref();

    const funkyOrgOrString = `and(meta_sender_type.eq.ORGANIZATION, meta_sender_id.eq.${ props.organization_id }), and(meta_receiver_type.eq.ORGANIZATION, meta_receiver_id.eq.${ props.organization_id })`;
    const funkyAgentOrString = `and(meta_sender_type.eq.AGENT, meta_sender_id.eq.${ props.agent_id }), and(meta_receiver_type.eq.AGENT, meta_receiver_id.eq.${ props.agent_id })`;
    const funkyOrString = props.organization_id ? funkyOrgOrString : funkyAgentOrString;

    const pgRestOptions = {
      from: 'orders',
      select: `
        id,
        updated_at,
        amount,
        currency,
        external_reference,
        order_status,
        directive:directive_id(
          directive_status,
          token
        ),
        lorawan_directive:lorawan_directive_id(
          directive_status,
          token
        ),
        meter_interaction:meter_interactions(
          meter_interaction_status,
          token,
          transactive_kwh
        ),
        sender_wallet:wallets!sender_wallet_id(
          ${ props.organization_id ? 'organization_id' : 'agent_id' }
        ),
        receiver_wallet:wallets!receiver_wallet_id(
          ${ props.organization_id ? 'organization_id' : 'agent_id' }
        ),
        meta_order_type,
        meta_sender_type,
        meta_sender_id,
        meta_sender_name,
        meta_sender_name_part_2,
        meta_receiver_type,
        meta_receiver_id,
        meta_receiver_name,
        meta_receiver_name_part_2,
        meta_author_name
      `,
      withDeleted: true,
      searchPaths: [ 'external_reference', 'meta_sender_name', 'meta_sender_name_part_2', 'meta_receiver_name', 'meta_receiver_name_part_2' ],
    };

    const columns = [
      {
        field: 'updated_at',
        header: 'Date',
        component: 'DateTime',
        sortable: !props.staticLimit,
      },
      {
        field: 'amount',
        header: 'Amount',
        component: 'SmartOrderAmount',
        negativeIf: data => data.meta_sender_id === (props.organization_id ?? props.agent_id),
      },
      {
        field: 'order_status',
        header: 'Status',
        component: 'OrderStatus',
      },
      props.showReference && {
        field: 'external_reference',
        header: 'Reference',
        hideWhenAllNil: true,
      },
      {
        field: 'directive.token|lorawan_directive.token|meter_interaction.token',
        header: 'Token',
        component: 'TransformValue',
        transformer: 'identity',
        hideWhenAllNil: true,
      },
      {
        field: 'meta_sender_type',
        header: 'Sender',
        component: 'SenderReceiver',
      },
      {
        field: 'meta_receiver_type',
        header: 'Receiver',
        component: 'SenderReceiver',
      },
      {
        field: 'meta_author_name',
        header: 'Author',
      },
      props.showReference && {
        field: 'external_reference',
        hideWhen: entries => entries.every(entry => !entry.external_reference || [ 'INITIALISED', 'TIMED_OUT' ].includes(entry.order_status)),
        component: 'VerifyOrder',
      },
    ].filter(Boolean);

    const openOrderDetailsModal = orderData => {
      nxtModal.open(OrderDetailsModal, {
        props: {
          header: 'Transaction details',
        },
        data: {
          orderData,
          isSender: orderData.meta_sender_id === (props.organization_id ?? props.agent_id),
        },
      });
    };

    // Static data if required
    const staticData = ref();
    const fetchStaticData = () => baseSupabaseRepo.client
      .from(pgRestOptions.from)
      .select(pgRestOptions.select)
      .order('updated_at', { ascending: false })
      .limit(props.staticLimit)
      .or(funkyOrString)
      .then(baseSupabaseRepo.handleResponse)
      .then(data => { staticData.value = data; })
    ;
    if(props.staticLimit) fetchStaticData();


    /**
     * Realtime
    **/

    const refreshTable = () => {
      if(props.staticLimit) fetchStaticData();
      else if(ordersTable.value) {
        ordersTable.value.refresh();
      }
    };

    const channelUnsubscribe = useRealtime().addChannel(sbClient => {
      const channel = sbClient.channel('qilin_transactions_table');

      channel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `meta_sender_id=eq.${ (props.organization_id ?? props.agent_id) }`,
        }, refreshTable)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `meta_receiver_id=eq.${ (props.organization_id ?? props.agent_id) }`,
        }, refreshTable)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'directives',
          // @TODO :: Do better filtering when Supabase implements it or we have more finegrained RLS columns
          filter: 'directive_type=eq.TOP_UP',
        }, refreshTable)
      ;

      return channel;
    });

    onBeforeUnmount(channelUnsubscribe);

    return { ordersTable, pgRestOptions, columns, funkyOrString, openOrderDetailsModal, staticData };
  },

  components: { NxtTable },
};
</script>
