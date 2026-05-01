<template>
<nxt-table
  ref="meterInteractionsTable"
  v-if="!staticLimit || !!staticData"
  :title="!staticLimit ? (meterReference ? `Meter ${ meterReference } - ` : '') + 'Interactions' : undefined"
  :provider="!!staticLimit ? 'raw-data' : 'supabase-rest'"
  :pagination="!staticLimit"
  :variant="!!staticLimit ? 'in-card' : undefined"
  :data-entries="staticData"
  :columns="columns"
  :pg-rest-options="pgRestOptions"
  :on-row-click="useAdvanced ? openDeliveryDetailsModal : undefined"
  :initial-variables="!staticLimit ? {
    sort: 'updated_at',
    order: 'desc',
  } : undefined"
  :hidden-filters="{
    meter_id,
  }"
/>
</template>

<script>
import { onBeforeUnmount, ref } from 'vue';
import { compose, map, toPairs, sort, ascend, prop } from 'ramda';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { useRealtime } from '@nxt/libraries/api-connection/composables/useRealtime';
import { useNxtModal } from '../NxtModal';
import { METER_INTERACTIONS_MAP } from '@nxt/libraries/format-maps';

import NxtTable from '../table/NxtTable.vue';
import DeliveryDetailsModal from '../modals/DeliveryDetailsModal.vue';

const formatMapToFilterOptions = compose(
  sort(ascend(prop('label'))),
  map(([ key, { title } ]) => ({ value: key, label: title })),
  toPairs,
);

export default {
  props: {
    meter_id: {
      type: [ Number, String ],
    },
    meterReference: {
      type: String,
    },
    staticLimit: {
      type: Number,
      default: null,
    },
    useAdvanced: {
      type: Boolean,
      default: false,
    },
  },

  emits: [ 'first-static-fetch' ],

  setup(props, ctx) {
    const nxtModal = useNxtModal();
    const meterInteractionsTable = ref();

    const pgRestOptions = {
      from: 'meter_interactions',
      select: `
        id,
        updated_at,
        meter_interaction_status,
        meter_interaction_type,

        transactive_kwh,
        target_power_limit,

        token,
        result_value,
        delivery_failure_history,

        batch_execution_id,
        meter_commissioning_id
      `,
      withDeleted: true,
    };

    const columns = [
      {
        field: 'updated_at',
        header: 'Date',
        component: 'DateTime',
        sortable: !props.staticLimit,
      },
      {
        field: 'meter_interaction_type',
        header: 'Type',
        component: 'FormatText',
        sortable: !props.staticLimit,
        filterOptions: !props.staticLimit ? {
          type: 'select',
          placeholder: 'Command type',
          options: formatMapToFilterOptions(METER_INTERACTIONS_MAP),
          field: 'meter_interaction_type',
        } : undefined,
      },
      {
        field: 'meter_interaction_type',
        header: 'Result',
        component: 'FormatResultValue',
      },
      // {
      //   field: 'result_value',
      //   header: 'Raw',
      // },
      {
        field: 'token',
        header: 'Token',
        component: 'TransformValue',
        transformer: 'splitEveryFourCharacters',
        hideWhenAllNil: true,
      },
      {
        field: 'meter_interaction_status',
        header: 'Status',
        component: 'FormatText',
      },
      props.useAdvanced && {
        field: 'meter_interaction_status',
        component: 'RetryInteraction',
      },
      props.useAdvanced && {
        field: 'batch_execution_id',
        component: 'Icons',
      },
    ].filter(Boolean);

    const openDeliveryDetailsModal = interactionData => {
      nxtModal.open(DeliveryDetailsModal, {
        props: {
          header: 'Delivery details',
        },
        data: {
          interactionData,
        },
      });
    };


    /**
     * Static data (on meter/customer pages)
    **/

    const staticData = ref();
    const fetchStaticData = () => baseSupabaseRepo.client
      .from(pgRestOptions.from)
      .select(pgRestOptions.select)
      .order('created_at', { ascending: false })
      .limit(props.staticLimit)
      .match({ meter_id: props.meter_id })
      .then(baseSupabaseRepo.handleResponse)
      .then(data => {
        staticData.value = data;
        return data;
      })
    ;
    if(props.staticLimit) {
      fetchStaticData().then(data => {
        ctx.emit('first-static-fetch', data);
      });
    }


    /**
     * Realtime
    **/

    const refreshTable = () => {
      if(props.staticLimit) fetchStaticData();
      else if(meterInteractionsTable.value) {
        meterInteractionsTable.value.refresh();
      }
    };

    const channelUnsubscribe = useRealtime().addChannel(sbClient => {
      const channel = sbClient.channel('qilin_meter_interactions_table');

      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meter_interactions',
        filter: `meter_id=eq.${ props.meter_id }`,
      }, refreshTable);

      return channel;
    });

    onBeforeUnmount(channelUnsubscribe);

    return { meterInteractionsTable, pgRestOptions, columns, openDeliveryDetailsModal, staticData };
  },

  components: { NxtTable },
};
</script>
