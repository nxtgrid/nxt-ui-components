<template>
<section v-if="agent" class="card">
  <header class="card-header">
    <h1 class="h2">
      {{ agent.account.full_name }}
    </h1>
    <nxt-button
      v-if="showActions"
      title="Edit agent"
      class="pull-right"
      icon-name="mdiAccountEditOutline"
      icon-only
      @click="openEditModal"
    />
  </header>
  <dl class="details-list">
    <dt>
      Phone
    </dt>
    <dd>
      {{ agent.account.phone ? `+${ agent.account.phone }` : '-' }}
    </dd>
    <dt>
      Email
    </dt>
    <dd>
      {{ agent.account.email || '-' }}
    </dd>
    <dt>
      Current balance
    </dt>
    <dd class="text-bold text-highlight">
      ₦ {{ accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
    </dd>
    <template v-if="telegramConnected">
      <dt>
        Telegram
      </dt>
      <dd>
        Connected ✅
      </dd>
    </template>
    <template v-else>
      <dt>
        Connect Telegram
      </dt>
      <dd>
        <span class="copy-link">{{ telegramCopyLink }}</span>
        <click-to-copy :source="telegramCopyLink" />
      </dd>
    </template>
  </dl>
  <footer v-if="showActions" class="card-footer">
    <nxt-button
      size="small"
      icon-name="mdiCurrencyUsd"
      @click="openTopUpModal"
    >
      Top-up agent account
    </nxt-button>
    <nxt-button
      size="small"
      icon-name="mdiCurrencyUsdOff"
      @click="openWithdrawModal"
    >
      Withdraw from agent wallet
    </nxt-button>
  </footer>
</section>
</template>

<script>
import { computed } from 'vue';
import { useNxtModal } from '@nxt/components/NxtModal';

import AddOrEditAgentModal from '@nxt/components/modals/AddOrEditAgentModal/AddOrEditAgentModal.vue';
import TopUpModal from '@nxt/components/modals/TopUpModal/TopUpModal.vue';
import WithdrawModal from '@nxt/components/modals/WithdrawModal/WithdrawModal.vue';
import ClickToCopy from '@nxt/components/ClickToCopy/ClickToCopy.vue';

export default {
  props: {
    agent: {
      type: Object,
      required: true,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
  },

  emits: [ 'delete' ],

  setup(props, ctx) {
    const nxtModal = useNxtModal();

    const accountBalance = computed(() => props.agent.wallet?.balance ?? 0);
    const telegramConnected = computed(() => !!props.agent.account.telegram_id);
    const telegramCopyLink = computed(() => `${ import.meta.env.VITE_TELEGRAM_BOT_URL }?start=${ props.agent.account?.telegram_link_token }`);

    const openEditModal = () => {
      nxtModal.open(AddOrEditAgentModal, {
        props: {
          header: 'Edit agent',
        },
        data: {
          agent: {
            id: props.agent.id,
            full_name: props.agent.account.full_name,
            phone: props.agent.account.phone,
            email: props.agent.account.email,
          },
          telegramData: {
            connected: telegramConnected.value,
            accountId: props.agent.account.id,
          },
        },
        onDone: data => {
          if(data?.redirect) ctx.emit('delete');
          else ctx.emit('update');
        },
      });
    };

    const openTopUpModal = () => {
      nxtModal.open(TopUpModal, {
        props: {
          header: `Top up ${ props.agent.account.full_name }'s account`,
        },
        data: {
          receiver: {
            type: 'agent',
            name: props.agent.account.full_name,
            walletId: props.agent.wallet.id,
          },
        },
      });
    };

    const openWithdrawModal = () => {
      nxtModal.open(WithdrawModal, {
        props: {
          header: `Withdraw from ${ props.agent.account.full_name }'s wallet`,
        },
        data: {
          sender: {
            name: props.agent.account.full_name,
            walletId: props.agent.wallet.id,
            balance: props.agent.wallet.balance,
          },
        },
      });
    };

    return {
      accountBalance,
      telegramConnected,
      telegramCopyLink,
      openEditModal,
      openTopUpModal,
      openWithdrawModal,
    };
  },

  components: { ClickToCopy },
};
</script>
