<template>
<nxt-table
  ref="agentsTable"
  title="Agents"
  :columns="columns"
  :pg-rest-options="pgRestOptionsAgents"
  :row-link-generator="createAgentLinkFn"
  :initial-variables="{
    sort: 'full_name',
  }"
  :hidden-filters="{ grid_id }"
>
  <template v-slot:header>
    <nxt-button
      v-if="showActions"
      title="Add an agent"
      icon-name="mdiAccountPlusOutline"
      icon-only
      @click="openCreateAgentModal"
    />
  </template>
</nxt-table>
</template>

<script>
import { ref } from 'vue';
import { useNxtModal } from '@nxt/components/NxtModal';

import NxtTable from '@nxt/components/table/NxtTable.vue';
import AddOrEditAgentModal from '@nxt/components/modals/AddOrEditAgentModal/AddOrEditAgentModal.vue';

export default {
  props: {
    grid_id: {
      type: [ Number, String ],
      required: true,
    },
    createAgentLinkFn: {
      type: Function,
      required: true,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
  },

  setup(props) {
    const nxtModal = useNxtModal();
    const agentsTable = ref();

    const pgRestOptionsAgents = {
      from: 'agents_with_account',
      select: `
          id,
          full_name,
          phone,
          wallets (
            balance
          )
        `,
      searchPaths: [ 'full_name' ],
    };

    const columns = [
      {
        field: 'full_name',
        header: 'Name',
        sortable: true,
        createLink: props.createAgentLinkFn,
      },
      {
        field: 'wallets.balance',
        header: 'Balance',
        component: 'AmountWithCurrency',
      },
      {
        field: 'phone',
        header: 'Phone',
        component: 'PhoneNumber',
      },
    ];

    const openCreateAgentModal = () => {
      nxtModal.open(AddOrEditAgentModal, {
        props: {
          header: 'New agent',
        },
        data: {
          grid_id: props.grid_id,
        },
        onDone: agentsTable.value.refresh,
      });
    };

    return {
      agentsTable,
      pgRestOptionsAgents,
      columns,
      openCreateAgentModal,
    };
  },

  components: {
    NxtTable,
  },
};
</script>
