<template>
<div>
  <p class="h5">
    Status:
    <span :class="deliveryDetails.status === 'SUCCESSFUL' ? 'text-success' : deliveryDetails.status === 'FAILED' ? 'text-error' : 'text-highlight'">{{ parseStatus(deliveryDetails.status) }}</span>
  </p>
  <!-- <p class="p"></p> -->

  <div class="failure-history">
    <p class="h5">Delivery history</p>
    <p v-if="isLoadingOngoingStatus" class="p">Loading history...</p>
    <ul v-else-if="deliveryDetails.history?.length" class="failure-history__list">
      <li
        v-for="attempt in deliveryDetails.history"
        :key="attempt.timestamp"
        class="failure-history__attempt"
      >
        {{ toPrettyDate(attempt.timestamp, { withSeconds: true }) }}
        (state: <span class="text-bold text-highlight">{{ parseStatus(attempt.status) }}</span>)<br>
        <template v-if="attempt.isFinal">
          <span class="text-bold text-error">This was the final failure</span><br>
        </template>
        {{ attempt.reason }}<br>
        <template v-if="attempt.errorCode">Code: {{ attempt.errorCode }} </template>
        <template v-if="attempt.details">Details: {{ attempt.details }}</template>
      </li>
    </ul>
    <p v-else class="p">None</p>
  </div>
</div>
</template>

<script>
import { reactive, ref } from 'vue';
import { useNxtModal } from '../NxtModal';
import { useGlobalStore } from '@nxt/nxt-vue';
import { prettyLocalizedDateTime } from '@nxt/libraries/date-helpers';
import { baseOpsRestRepo } from '@nxt/libraries/api-connection/repo/baseOpsRestRepo';

const parseStatus = status => status
  .split('_')
  .join(' ')
  .toLowerCase()
  .replace(/^\w/, char => char.toUpperCase())
  .replace(/\bns\b/gi, 'network server')
  .replace(/\bgw\b/gi, 'gateway')
;

export default {
  setup() {
    const modal = useNxtModal();
    const globalStore = useGlobalStore();

    const { interactionData } = modal.data;

    const toPrettyDate = prettyLocalizedDateTime(globalStore.timezone);

    const _interactionStatus = interactionData.meter_interaction_status;

    const deliveryDetails = reactive({
      status: _interactionStatus,
      history: interactionData.delivery_failure_history ?? [],
    });

    const isLoadingOngoingStatus = ref(false);

    if(_interactionStatus === 'PROCESSING') {
      isLoadingOngoingStatus.value = true;
      baseOpsRestRepo
        .getMeterInteractionDeliveryStatus(interactionData.id)
        .then(_status => {
          if(!_status) return;
          deliveryDetails.status = _status.delivery_status;
          deliveryDetails.history = [ ..._status.delivery_failure_history, ...deliveryDetails.history ];
        })
        .catch(err => {
          // Log fetch errors so we can debug if the endpoint fails
          // (don't throw so modal doesn't break rendering)
          console.error('Failed to fetch delivery status', err);
        })
        .finally(() => {
          isLoadingOngoingStatus.value = false;
        })
      ;
    }

    return { deliveryDetails, isLoadingOngoingStatus, toPrettyDate, parseStatus };
  },
};
</script>

<style lang="scss">
// .delivery-meter {
//   margin-top: 0.5rem;
//   padding-top: 0.5rem;
//   border-top: thin solid $nxt-color-blue-light;
// }

.failure-history {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: thin solid $nxt-color-blue-light;

  &__list {
    margin-top: 0.5rem;
    list-style: none;
    padding: 0;
    font-size: 0.875rem;
  }

  &__attempt {
    position: relative;
    padding-left: 16px;

    &::before {
      @include pseudo;
      width: 10px;
      height: 10px;
      background-color: $nxt-color-blue-light;
      border-radius: 5px;
      left: 0;
      top: 4px;
    }
  }

  &__attempt:not(:last-child) {
    padding-bottom: 0.5rem;

    &::after {
      @include pseudo;
      width: 2px;
      height: 100%;
      background-color: $nxt-color-blue-light;
      left: 4px;
      top: 8px;
    }
  }
}
</style>
