<template>
<p>This operation will reverse the connection fees paid so far.</p>

<div class="nxt-modal-footer">
  <nxt-button
    size="small"
    :disabled="isReversing"
    @click="doClose"
  >
    Cancel
  </nxt-button>
  <nxt-button
    size="small"
    variant="primary"
    :disabled="isReversing"
    @click="doReversal"
  >
    Confirm reversal
  </nxt-button>
</div>
</template>

<script>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useNxtModal } from '@nxt/components/NxtModal';
import { restRepo } from '@/repo/restRepo';

export default {
  setup() {
    const modal = useNxtModal();
    const toast = useToast();

    const { sender_wallet_id, receiver_wallet_id, amount, currency } = modal.data;

    const isReversing = ref(false);

    const doReversal = async () => {
      isReversing.value = true;
      restRepo.createOrder({
        sender_wallet_id,
        receiver_wallet_id,
        amount: amount,
        currency: currency,
        payment_channel: 'AYRTON',
      })
        .then(() => {
          toast.success('Connection fee payment reversed.');
        })
        .catch(err => {
          const title = 'Error reversing transaction';
          console.error(title, err);
          toast.error(`${ title }: ${ err.message }`);
        })
        .finally(() => {
          isReversing.value = false;
          modal.done({ refreshBalance: true });
        })
      ;
    };

    return {
      receiver_wallet_id,
      isReversing,
      doClose: modal.close,
      doReversal,
    };
  },
};
</script>
