<template>
<dl class="details-list" v-if="!(withFlutterwave && receiver.type === 'meter')">
  <template v-if="!withFlutterwave">
    <dt>Sender:</dt>
    <dd>{{ myProfile.organization.name }}</dd>
  </template>
  <dt :class="{ 'text-error': !canIAffordThis }">Balance:</dt>
  <dd :class="{ 'text-error': !canIAffordThis }">₦ {{ myProfile.primary_wallet.balance.toLocaleString() }}</dd>
  <template v-if="!withFlutterwave">
    <dt>Receiver:</dt>
    <dd>{{ receiver.name }}</dd>
  </template>
</dl>

<form @submit.prevent="doTopUp">
  <div class="nxt-form-column mt-1" style="max-width: 160px">
    <label for="amount">Amount</label>
    <div class="nxt-input-with-prefix">
      <span class="nxt-input-prefix text-bold">₦</span>
      <input
        id="amount"
        type="number"
        class="nxt-input"
        v-model="topUpAmount"
        :step="amountStep ?? 100"
        min="0"
        required
      />
    </div>
  </div>

  <nxt-modal-save-cancel-footer
    :is-disabled="isToppingUp || amountIsTooSmall || !canIAffordThis"
    :save-button-text="saveButtonText || 'Top up'"
  />
</form>
</template>

<script>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useToast } from 'vue-toastification';
import { useNxtModal } from '@nxt/components/NxtModal';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { baseOpsRestRepo } from '@nxt/libraries/api-connection/repo/baseOpsRestRepo';
import { useFlutterwave, createFlutterwaveReference } from '@nxt/composables/flutterwave';

import NxtModalSaveCancelFooter from '@nxt/components/NxtModal/NxtModalSaveCancelFooter.vue';

export default {
  setup() {
    const modal = useNxtModal();
    const toast = useToast();
    const accountStore = useAccountStore();
    const { myProfile } = storeToRefs(accountStore);

    const { saveButtonText, withFlutterwave, amountStep } = modal.props;
    const { receiver, presetAmount } = modal.data;

    const flutterwave = withFlutterwave ? useFlutterwave() : {};

    const isToppingUp = ref(false);
    const topUpAmount = ref(presetAmount ?? 100);

    const amountIsTooSmall = computed(() => topUpAmount.value <= 0);
    const canIAffordThis = computed(() => withFlutterwave || myProfile.value.primary_wallet.balance >= topUpAmount.value);

    const doTopUp = async () => {
      if(amountIsTooSmall.value || !canIAffordThis.value) return;
      isToppingUp.value = true;

      if(withFlutterwave) {
        if(!receiver.type || !receiver.name || (receiver.type !== 'organization' && !receiver.organizationName)) {
          console.warn('[DEV WARNING] Always provide a type and name (and organization name if applicable) for the receiver');
          isToppingUp.value = false;
          return;
        }
        if(!receiver.email) {
          console.warn('[DEV WARNING] Always provide an email address for the receiver');
          isToppingUp.value = false;
          return;
        }

        const flutterwaveIdentifier = receiver.type === 'organization' ? receiver.name : `${ receiver.organizationName }+${ receiver.name }`;
        const flutterwaveReference = createFlutterwaveReference(flutterwaveIdentifier);

        try {
          // First create an order
          const order = await baseOpsRestRepo.createFlutterwaveOrder({
            external_reference: flutterwaveReference,
            amount: topUpAmount.value,
            currency: 'NGN',
            receiver_wallet_id: receiver.walletId,
            payment_channel: 'AYRTON',
          });

          // Then create a Flutterwave payment using the same id
          const { result } = await flutterwave.pay({
            tx_ref: flutterwaveReference,
            amount: topUpAmount.value,
            currency: 'NGN',
            customer: {
              name: receiver.name,
              email: receiver.email,
              phone_number: receiver.phone,
            },
            meta: {
              organization: myProfile.value.organization.name,
              type: receiver.type === 'meter' ? 'meter_topup' : 'wallet_topup',
              receiver_type: receiver.type,
            },
          });

          if(result === 'canceled')
            baseOpsRestRepo.cancelOrder({ id: order.id, external_reference: flutterwaveReference });
          else modal.done();
        }
        catch(err) {
          const title = 'Error topping up';
          console.error(title, err);
          toast.error(`${ title }: ${ err.message }`);
        }
        finally {
          isToppingUp.value = false;
        }
      }
      else {
        baseOpsRestRepo.createOrder({
          receiver_wallet_id: receiver.walletId,
          sender_wallet_id: myProfile.value.primary_wallet.id,
          amount: topUpAmount.value,
          currency: 'NGN',
          payment_channel: 'AYRTON',
        })
          .then(() => {
            toast.success('Top-up ordered');
            modal.done();
          })
          .catch(err => {
            const title = 'Error topping up';
            console.error(title, err);
            toast.error(`${ title }: ${ err.message }`);
          })
          .finally(() => {
            isToppingUp.value = false;
          })
        ;
      }
    };

    return {
      saveButtonText,
      withFlutterwave,
      amountStep,
      myProfile,
      receiver,
      topUpAmount,
      amountIsTooSmall,
      canIAffordThis,
      isToppingUp,
      doTopUp,
    };
  },

  components: { NxtModalSaveCancelFooter },
};
</script>
