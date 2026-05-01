<template>
<form @submit.prevent="doSave">
  <div class="nxt-form-column">
    <label for="full_name">Full name*</label>
    <input
      id="full_name"
      type="text"
      class="nxt-input"
      v-model="params.full_name"
      required
    />
  </div>

  <div class="nxt-form-column mt-1">
    <label for="phone">Phone*</label>
    <div class="nxt-input-with-prefix">
      <span class="nxt-input-prefix text-bold">+</span>
      <input
        id="phone"
        type="tel"
        class="nxt-input"
        v-model="params.phone"
        required
      />
    </div>
  </div>
  <p class="text-small mt-0-half">
    Enter a valid phone number with country code, omitting the initial '+' or '00'
  </p>

  <div class="nxt-form-column mt-1">
    <label for="email">Email</label>
    <input
      id="email"
      type="email"
      class="nxt-input"
      v-model="params.email"
    />
  </div>

  <div v-if="telegramData?.connected" class="mt-1">
    <div class="flex-horizontal">
      <p>
        Telegram connected ✅
      </p>
      <nxt-button
        class="pull-right"
        type="button"
        size="tiny"
        @click="confirmDisconnectTelegram"
      >
        Disconnect
      </nxt-button>
    </div>
  </div>

  <div
    v-if="isUpdate"
    class="mt-2 pb-1 buttons-sbs"
    style="border-bottom: 1px solid #d1d5da;"
  >
    <nxt-button
      type="button"
      size="small"
      variant="danger"
      :icon-svg="mdiTrashCanOutline"
      @click="confirmDeleteAgent"
      :disabled="isSaving"
    >
      Delete agent
    </nxt-button>
  </div>

  <nxt-modal-save-cancel-footer :is-disabled="isSaving" />
</form>
</template>

<script>
import { ref, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import { useNxtModal } from '@nxt/components/NxtModal';
import { baseOpsRestRepo } from '@nxt/libraries/api-connection/repo/baseOpsRestRepo';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { prepPhoneForEdit, prepPhoneForSave } from '@nxt/libraries/phone-helpers';
import { NIGERIA_PHONE_PATTERN } from '@nxt/libraries/constants';

import NxtModalSaveCancelFooter from '@nxt/components/NxtModal/NxtModalSaveCancelFooter.vue';
import { mdiTrashCanOutline } from '@mdi/js';


export default {
  setup() {
    const modal = useNxtModal();
    const toast = useToast();

    const { grid_id, agent, telegramData } = modal.data;

    const isUpdate = !!agent;
    const isSaving = ref(false);

    const params = reactive({
      full_name: agent?.full_name ?? '',
      phone: agent?.phone ? prepPhoneForEdit(agent.phone) : '',
      email: agent?.email ?? '',
    });

    const doSave = () => {
      if(!NIGERIA_PHONE_PATTERN.test(params.phone)) {
        toast.warning('Invalid: Phone number should be a valid Nigerian phone number');
        return;
      }

      isSaving.value = true;
      if(isUpdate) {
        baseOpsRestRepo
          .updateAgent({
            id: agent.id,
            full_name: params.full_name,
            phone: prepPhoneForSave(params.phone),
            email: params.email.length ? params.email : null,
          })
          .then(res => {
            toast.success('Updated agent ' + params.full_name);
            modal.done(res);
          })
          .catch(err => {
            const title = 'Error editing agent';
            console.error(title, err);
            toast.error(`${ title }: ${ err.message }`);
          })
          .finally(() => {
            isSaving.value = false;
          })
        ;
        isSaving.value = false;
      }
      else {
        baseOpsRestRepo
          .createAgent({
            full_name: params.full_name,
            phone: prepPhoneForSave(params.phone),
            email: params.email.length ? params.email : null,
            grid_id: parseInt(grid_id),
          })
          .then(res => {
            toast.success('Created agent ' + params.full_name);
            modal.done(res);
          })
          .catch(err => {
            const title = 'Error creating agent';
            console.error(title, err);
            toast.error(`${ title }: ${ err.message }`);
          })
          .finally(() => {
            isSaving.value = false;
          })
        ;
      }
    };

    const deleteAgent = async () => {
      isSaving.value = true;
      const deletedAgent = await baseOpsRestRepo.deleteAccount({ id: agent.id, type: 'AGENT' });
      isSaving.value = false;
      toast.success(`Removed agent ${ deletedAgent.full_name }.`);
      modal.done({ redirect: true });
    };

    const confirmDeleteAgent = () => {
      const confirmed = confirm(`Are you sure you want to remove ${ agent.full_name }'s account?`);
      if(confirmed) deleteAgent();
    };

    const disconnectTelegram = async () => {
      isSaving.value = true;
      const updatedAgent = await baseSupabaseRepo.client
        .from('accounts')
        .update({ telegram_id: null })
        .eq('id', telegramData.accountId)
        .select('id')
        .maybeSingle()
        .then(baseSupabaseRepo.handleResponse)
      ;
      isSaving.value = false;
      toast.success(`Disconnected ${ params.full_name }'s Telegram'.`);
      modal.done(updatedAgent);
    };

    const confirmDisconnectTelegram = () => {
      const confirmed = confirm(`Are you sure you want to disconnect ${ params.full_name }'s Telegram?`);
      if(confirmed) disconnectTelegram();
    };

    return {
      params,
      telegramData,
      doSave,
      confirmDeleteAgent,
      confirmDisconnectTelegram,
      isUpdate,
      isSaving,
      mdiTrashCanOutline,
    };
  },

  components: { NxtModalSaveCancelFooter },
};
</script>
