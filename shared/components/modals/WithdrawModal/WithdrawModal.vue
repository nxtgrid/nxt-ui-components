<template>
<dl class="details-list">
  <dt>Sender:</dt>
  <dd>{{ sender.name }}</dd>
  <dt>Balance:</dt>
  <dd>₦ {{ sender.balance.toLocaleString() }}</dd>
  <dt>Receiver:</dt>
  <dd>{{ myProfile.organization.name }}</dd>
</dl>

<form @submit.prevent="doWithdraw">
  <div class="nxt-form-column mt-1" style="max-width: 160px">
    <label for="amount">Amount</label>
    <div class="nxt-input-with-prefix">
      <span class="nxt-input-prefix text-bold">₦</span>
      <input
        id="amount"
        type="number"
        class="nxt-input"
        v-model="withdrawAmount"
        step="100"
        min="0"
        required
      />
    </div>
  </div>

  <nxt-modal-save-cancel-footer
    :is-disabled="isWithdrawing"
    save-button-text="Withdraw"
  />
</form>
</template>

<script>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useToast } from 'vue-toastification';
import { useNxtModal } from '@nxt/components/NxtModal';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { baseOpsRestRepo } from '@nxt/libraries/api-connection/repo/baseOpsRestRepo';

import NxtModalSaveCancelFooter from '@nxt/components/NxtModal/NxtModalSaveCancelFooter.vue';

export default {
  setup() {
    const modal = useNxtModal();
    const toast = useToast();
    const accountStore = useAccountStore();
    const { myProfile } = storeToRefs(accountStore);

    const { sender } = modal.data;
    const isWithdrawing = ref(false);
    const withdrawAmount = ref(100);

    const doWithdraw = () => {
      // Validation
      if (withdrawAmount.value > sender.balance) {
        toast.warning('Withdraw amount is larger than account balance');
        return;
      }

      isWithdrawing.value = true;

      baseOpsRestRepo.createOrder({
        sender_wallet_id: sender.walletId,
        receiver_wallet_id: myProfile.value.primary_wallet.id,
        amount: withdrawAmount.value,
        currency: 'NGN',
        payment_channel: 'AYRTON',
      })
        .then(() => {
          toast.success('Withdraw successful');
          modal.done();
        })
        .catch(err => {
          const title = 'Error withdrawing';
          console.error(title, err);
          toast.error(`${ title }: ${ err.message }`);
        })
        .finally(() => {
          isWithdrawing.value = false;
        })
      ;
    };

    return {
      myProfile,
      sender,
      withdrawAmount,
      isWithdrawing,
      doWithdraw,
    };
  },

  components: { NxtModalSaveCancelFooter },
};
</script>
