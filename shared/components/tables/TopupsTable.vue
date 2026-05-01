<template>
<nxt-table
  ref="ordersTable"
  v-if="!staticLimit || !!staticData"
  :title="!staticLimit ? (meterReference ? `Meter ${ meterReference } - ` : '') + 'Top-ups' : undefined"
  :provider="!!staticLimit ? 'raw-data' : 'supabase-rest'"
  :pagination="!staticLimit"
  :variant="!!staticLimit ? 'in-card' : undefined"
  :data-entries="staticData"
  :columns="columns"
  :pg-rest-options="pgRestOptions"
  :initial-variables="!staticLimit ? {
    sort: 'updated_at',
    order: 'desc',
  } : undefined"
  :hidden-filters="{
    historical_grid_id: grid_id,
    meta_receiver_id: meter_id,
    meta_order_type: 'ENERGY_TOPUP',
    ...(meter_ids && { in: [ 'meta_receiver_id', meter_ids] }),
  }"
>
  <template #header="{ doDownload }" v-if="withDownloads">
    <nxt-button
      title="Download list of topups"
      :icon-svg="mdiDownload"
      icon-only
      @click="openDownloadModal(doDownload)"
    />
  </template>
</nxt-table>
</template>
<script>
import { onBeforeUnmount, ref } from 'vue';
import DownloadTopupsModal from '@nxt/components/modals/DownloadTopupsModal/DownloadTopupsModal.vue';
import { useNxtModal } from '../NxtModal/';
import { mdiDownload } from '@mdi/js';
import { useRealtime } from '@nxt/libraries/api-connection/composables/useRealtime';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';

import NxtTable from '../table/NxtTable.vue';

export default {
  props: {
    grid_id: {
      type: [ Number, String ],
    },
    meter_id: {
      type: [ Number, String ],
    },
    meter_ids: {
      type: Array,
    },
    meterReference: {
      type: String,
    },
    createMeterLinkFn: {
      type: Function,
    },
    createCustomerLinkFn: {
      type: Function,
    },
    withDownloads: {
      type: Boolean,
      default: false,
    },
    staticLimit: {
      type: Number,
      default: null,
    },
    hideSenderDetails: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const nxtModal = useNxtModal();
    const ordersTable = ref();

    const pgRestOptions = {
      from: 'orders',
      select: `
        id,
        updated_at,
        amount,
        currency,
        order_status,
        directive:directive_id(
          directive_status,
          token,
          kwh
        ),
        lorawan_directive:lorawan_directive_id(
          directive_status,
          token,
          kwh
        ),
        meter_interaction:meter_interactions(
          meter_interaction_status,
          token,
          transactive_kwh
        ),
        payment_channel,
        payment_method,
        meta_order_type,
        meta_sender_name,
        meta_receiver_name,
        meta_receiver_name_part_2,
        meta_receiver_id,
        meta_receiver_id_part_2,
        meta_author_name
      `,
      withDeleted: true,
      searchPaths: [ 'meta_sender_name', 'meta_receiver_name', 'meta_receiver_name_part_2' ],
      download: {
        fileName: 'Top-ups',
        select: `
          Date:updated_at,
          Amount:amount,
          Currency:currency,
          Order Status:order_status,
          Meter:meta_receiver_name,
          Customer:meta_receiver_name_part_2,
          Sender:meta_sender_name,
          Author:meta_author_name,
          External Reference:external_reference,
          Payment Channel:payment_channel,
          Payment Method:payment_method,
          ...directive_id(
            kWh:kwh,
            Directive Status:directive_status,
            Token:token
          )
        `,
      },
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
        component: 'AmountWithCurrency',
        sortable: !props.staticLimit,
      },
      {
        field: 'directive.kwh|lorawan_directive.kwh|meter_interaction.transactive_kwh',
        header: 'kWh',
        component: 'TransformValue',
        transformer: 'roundToTwoDecimals',
      },
      {
        field: 'order_status',
        header: 'Status',
        component: 'OrderStatus',
      },
      {
        field: 'directive.token|lorawan_directive.token|meter_interaction.token',
        header: 'Token',
        component: 'TransformValue',
        transformer: 'splitEveryFourCharacters',
      },
      !props.meter_id && {
        field: 'meta_receiver_name',
        header: 'Meter',
        ...(props.createMeterLinkFn && { createLink: props.createMeterLinkFn }),
      },
      (!props.meter_id && !props.meter_ids) && {
        field: 'meta_receiver_name_part_2',
        header: 'Customer',
        ...(props.createCustomerLinkFn && { createLink: props.createCustomerLinkFn }),
      },
      !props.hideSenderDetails && {
        field: 'meta_sender_name',
        header: 'Sender',
      },
      !props.hideSenderDetails && {
        field: 'payment_channel',
        header: 'Payment channel',
        component: 'FormatText',
      },
      !props.hideSenderDetails && {
        field: 'meta_author_name',
        header: 'Author',
        hideWhenAllNil: true,
      },
    ].filter(Boolean);

    const openDownloadModal = downloadFn => {
      nxtModal.open(DownloadTopupsModal, {
        props: {
          header: 'Download list of top-ups for period',
        },
        data: { downloadFn },
      });
    };

    // Static data if required
    const staticData = ref();
    const staticDataQuery = baseSupabaseRepo.client
      .from(pgRestOptions.from)
      .select(pgRestOptions.select)
      .order('updated_at', { ascending: false })
      .limit(props.staticLimit)
      .match({
        ...(props.grid_id && { historical_grid_id: props.grid_id }),
        ...(props.meter_id && { meta_receiver_id: props.meter_id }),
        meta_order_type: 'ENERGY_TOPUP',
      })
    ;
    if(props.meter_ids) staticDataQuery.in('meta_receiver_id', props.meter_ids);
    const fetchStaticData = () => staticDataQuery
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
      const channel = sbClient.channel('qilin_topups_table');

      const ordersFilter = props.meter_id ? `meta_receiver_id=eq.${ props.meter_id }`
        : props.meter_ids ? `meta_receiver_id=in.(${ props.meter_ids.join(', ') })`
          : `historical_grid_id=eq.${ props.grid_id }`
      ;

      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: ordersFilter,
      }, refreshTable);

      if(props.meter_id || props.meter_ids) {
        // @TODO :: Implement multi-filter when Supabase has it (add TOP_UPS specific filter)
        const directivesFilter = props.meter_id ? `meter_id=eq.${ props.meter_id }`
          : `meter_id=in.(${ props.meter_ids.join(', ') })`;
        channel
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'directives',
            filter: directivesFilter,
          }, refreshTable)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'lorawan_directives',
            filter: directivesFilter,
          }, refreshTable)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'meter_interactions',
            filter: directivesFilter,
          }, refreshTable)
        ;
      }
      else {
        // @TODO :: Implement at grid level when we have RLS value (currently we have only rls_organization_id)
      }

      return channel;
    });

    onBeforeUnmount(channelUnsubscribe);

    return { ordersTable, pgRestOptions, columns, openDownloadModal, staticData, mdiDownload };
  },

  components: { NxtTable },
};
</script>
