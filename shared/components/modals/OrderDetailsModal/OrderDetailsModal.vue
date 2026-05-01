<template>
<div
  class="order-details__title"
  :class="{
    'order-details__title--pending': status === 'PENDING',
    'order-details__title--failed': status === 'FAILED',
  }"
>
  <p class="h3">
    ₦ {{ (isSender ? '-' : '+') + orderData.amount.toLocaleString() }}
  </p>
  <mdi-icon v-if="status === 'PENDING'" :icon="mdiClockOutline" />
</div>

<p class="p text-small" v-if="isLoading">Loading...</p>
<template v-else>
  <p v-if="status !== 'COMPLETED'" class="p text-small">
    Status: {{ ORDER_STATUS_MAP[orderData.order_status] }}
  </p>
  <p v-if="status !== 'PENDING' && isNotNil(balanceAfter)" class="p text-small">
    Balance after transaction: ₦ {{ balanceAfter.toLocaleString() }}
  </p>
</template>

<p class="p text-bold mt-1">{{ isSender ? 'To' : 'From' }}:</p>
<p class="p text-larger">{{ (isSender ? orderData.meta_receiver_name : orderData.meta_sender_name) }}</p>

<div class="order-details__details">
  <p class="p text-bold">Date:</p>
  <p>{{ prettyDate }}</p>

  <template v-if="orderData.meter_interaction?.token">
    <p class="p text-bold mt-1">Token:</p>
    <p>{{ orderData.meter_interaction.token }}</p>
  </template>

  <template v-if="orderData.external_reference">
    <p class="p text-bold mt-1">Reference:</p>
    <p>{{ orderData.external_reference }}</p>
  </template>

  <template v-if="orderData.author">
    <p class="p text-bold mt-1">Author:</p>
    <p>{{ orderData.author.member.full_name }}</p>
  </template>
</div>
</template>

<script>
import { isNotNil } from 'ramda';
import { ref } from 'vue';
import { useNxtModal } from '@nxt/components/NxtModal';
import { useGlobalStore } from '@nxt/nxt-vue';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { prettyLocalizedDateTime } from '@nxt/libraries/date-helpers';
import { ORDER_STATUS_MAP } from '@nxt/libraries/format-maps';
import { mdiClockOutline } from '@mdi/js';

const simplifyStatus = status => {
  if(status === 'COMPLETED') return 'COMPLETED';
  if([ 'INITIALISED', 'PENDING' ].includes(status)) return 'PENDING';
  return 'FAILED';
};

export default {
  setup() {
    const modal = useNxtModal();
    const globalStore = useGlobalStore();

    const { orderData, isSender } = modal.data;

    const isLoading = ref(true);
    const balanceAfter = ref(null);
    const prettyDate = prettyLocalizedDateTime(globalStore.timezone)(orderData.updated_at);
    const status = simplifyStatus(orderData.order_status);

    const fetchDetails = async () => {
      const order = await baseSupabaseRepo.client
        .from('orders')
        .select('sender_wallet_id, receiver_wallet_id')
        .eq('id', orderData.id)
        .maybeSingle()
        .then(baseSupabaseRepo.handleResponse)
      ;
      const transactions = await baseSupabaseRepo.client
        .from('transactions')
        .select('wallet_id, balance_after')
        .eq('order_id', orderData.id)
        .then(baseSupabaseRepo.handleResponse)
      ;
      return { ...order, transactions };
    };
    fetchDetails();

    if(status === 'PENDING') isLoading.value = false;
    else {
      fetchDetails()
        .then(order => {
          const appropriateWalletId = isSender ? order.sender_wallet_id : order.receiver_wallet_id;
          balanceAfter.value = order.transactions
            .find(({ wallet_id }) => wallet_id === appropriateWalletId)
            ?.balance_after
          ;
        })
        .finally(() => { isLoading.value = false; })
      ;
    }

    return { isNotNil, isLoading, orderData, isSender, balanceAfter, prettyDate, status, ORDER_STATUS_MAP, mdiClockOutline };
  },
};
</script>

<style lang="scss">
.order-details {
  &__title {
    display: flex;
    align-items: center;
    column-gap: 8px;
    border-top: thin solid $nxt-color-blue-light;
    padding-top: 0.5rem;
    color: $nxt-color-blue-highlight;

    &--failed,
    &--pending {
      color: $nxt-color-placeholder;
    }

    &--failed .h3 {
      text-decoration: line-through;
    }
  }

  &__details {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: thin solid $nxt-color-blue-light;
  }
}
</style>
