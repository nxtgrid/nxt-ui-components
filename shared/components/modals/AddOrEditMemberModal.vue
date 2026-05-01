<template>
<form @submit.prevent="save">
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
    <label for="email">Email*</label>
    <input
      id="email"
      type="email"
      class="nxt-input"
      v-model="params.email"
      required
      :disabled="isUpdate"
    />
  </div>

  <div class="nxt-form-column mt-1">
    <label>Role*</label>
    <nxt-select
      v-model="params.member_type"
      :options="roleOptions"
      :disabled="!allowedRoles.includes(params.member_type)"
      required
    />
  </div>

  <div v-if="isUpdate" class="nxt-form-column mt-1">
    <label>Training level*</label>
    <nxt-select
      v-model="params.training_level"
      :options="trainingLevelOptions"
      required
    />
  </div>

  <div
    v-if="grids?.length"
    class="nxt-form-column mt-1"
  >
    <label>Using Sphinx for</label>
    <nxt-select
      v-model="params.busy_commissioning_id"
      :options="grids"
      option-label="name"
      option-value="id"
      placeholder="Select grid or leave empty"
      :show-clear="true"
    />
  </div>

  <div
    v-if="telegramData"
    class="mt-1"
  >
    <template v-if="telegramData.connected">
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
      <nxt-checkbox
        class="mt-1"
        label="Receiving Telegram revenue notifications"
        v-model="params.subscribed_to_telegram_revenue_notifications"
      />
    </template>
    <template v-else>
      <p>
        Connect Telegram
      </p>
      <div class="input-flexed mt-0-half">
        <p class="copy-link">
          {{ telegramData.copyLink }}
        </p>
        <click-to-copy :source="telegramData.copyLink" />
      </div>
    </template>
  </div>

  <nxt-checkbox
    v-if="isUpdate"
    class="mt-1"
    label="Hidden in Eos"
    v-model="params.hidden"
  />

  <nxt-button
    v-if="isUpdate"
    type="button"
    size="small"
    variant="danger"
    icon-name="mdiTrashCanOutline"
    class="mt-2"
    @click="confirmDeleteMember"
    :disabled="isSaving"
  >
    Delete member
  </nxt-button>

  <nxt-modal-save-cancel-footer :is-disabled="isSaving" />
</form>
</template>

<script>
import { ref, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import { getMemberRolesToSet } from '@nxt/libraries/api-connection/acl';
import { useNxtModal } from '@nxt/components/NxtModal';
import { baseOpsRestRepo } from '@nxt/libraries/api-connection/repo/baseOpsRestRepo';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { ROLE_MAP, TRAINING_LEVEL_MAP } from '@nxt/libraries/format-maps';

import ClickToCopy from '@nxt/components/ClickToCopy/ClickToCopy.vue';
import NxtModalSaveCancelFooter from '@nxt/components/NxtModal/NxtModalSaveCancelFooter.vue';
import NxtSelect from '@nxt/components/form/NxtSelect.vue';
import NxtCheckbox from '@nxt/components/form/NxtCheckbox.vue';

export default {
  setup() {
    const modal = useNxtModal();
    const toast = useToast();

    const { organization_id, grids, member } = modal.data;

    let telegramData;
    const isUpdate = !!member;
    const isSaving = ref(false);
    if(isUpdate && member.account?.telegram_link_token) {
      const { telegram_id, telegram_link_token } = member.account;
      telegramData = {
        connected: !!telegram_id,
        copyLink: `${ import.meta.env.VITE_TELEGRAM_BOT_URL }?start=${ telegram_link_token }`,
        accountId: member.account.id,
      };
    }

    const allowedRoles = getMemberRolesToSet();
    const inferRoleName = role => {
      const name = ROLE_MAP[role]?.short ?? role;
      const description = ROLE_MAP[role]?.extra;
      return name + (description ? ` (${ description })` : '');
    };
    const roleOptions = allowedRoles.map(role =>
      ({ value: role, label: inferRoleName(role) }));

    const trainingLevelOptions = Object.entries(TRAINING_LEVEL_MAP)
      .map(([ key, value ]) => ({ value: key, label: value }));

    const params = reactive({
      full_name: member?.account.full_name ?? '',
      email: member?.account?.email ?? '',
      member_type: member?.member_type ?? 'DEVELOPER',
      training_level: member?.training_level ?? 0,
      busy_commissioning_id: member?.busy_commissioning?.id,
      subscribed_to_telegram_revenue_notifications: member?.subscribed_to_telegram_revenue_notifications ?? false,
      hidden: member?.hidden ?? false,
    });

    const save = () => {
      isSaving.value = true;
      if(isUpdate) {
        baseOpsRestRepo
          .updateMember({
            id: member.id,
            full_name: params.full_name,
            member_type: params.member_type,
            training_level: parseInt(params.training_level),
            busy_commissioning_id: params.busy_commissioning_id ?? null,
            subscribed_to_telegram_revenue_notifications: params.subscribed_to_telegram_revenue_notifications,
            hidden: params.hidden,
          })
          .then(res => {
            toast.success('Successfully updated ' + params.full_name);
            modal.done(res);
          })
          .catch(err => {
            const title = 'Error updating member';
            console.error(title, err);
            toast.error(`${ title }: ${ err.message }`);
          })
          .finally(() => {
            isSaving.value = false;
          })
        ;
      }
      else {
        const origin = window.location.origin;
        // If we invite members ourselves (from Ayrton),
        // let the invitee redirect to default (app.nxtgrid.co).
        // Otherwise let them redirect to same platform
        // as being invited on.
        const redirectTo = origin.includes('ayrton') ? undefined : origin + '/';

        baseOpsRestRepo
          .inviteMember({
            email: params.email,
            full_name: params.full_name,
            organization_id,
            member_type: params.member_type,
            busy_commissioning_id: params.busy_commissioning_id,
            redirectTo,
          })
          .then(res => {
            toast.success('Sent invite to ' + params.full_name);
            modal.done(res);
          })
          .catch(err => {
            const title = 'Error inviting member';
            console.error(title, err);
            toast.error(`${ title }: ${ err.message }`);
          })
          .finally(() => {
            isSaving.value = false;
          })
        ;
      }
    };

    const deleteMember = async () => {
      isSaving.value = true;
      const deletedMember = await baseOpsRestRepo.deleteAccount({ id: member.id, type: 'MEMBER' });
      isSaving.value = false;
      toast.success(`Removed member ${ deletedMember.full_name }.`);
      modal.done(deletedMember);
    };

    const confirmDeleteMember = () => {
      const confirmed = confirm(`Are you sure you want to remove ${ member.account.full_name }'s account?`);
      if(confirmed) deleteMember();
    };

    const disconnectTelegram = async () => {
      isSaving.value = true;
      const updatedAccount = await baseSupabaseRepo.client
        .from('accounts')
        .update({ telegram_id: null })
        .eq('id', telegramData.accountId)
        .select('id')
        .maybeSingle()
        .then(baseSupabaseRepo.handleResponse)
      ;
      isSaving.value = false;
      toast.success(`Disconnected ${ member.account.full_name }'s Telegram'.`);
      modal.done(updatedAccount);
    };

    const confirmDisconnectTelegram = () => {
      const confirmed = confirm(`Are you sure you want to disconnect ${ member.account.full_name }'s Telegram?`);
      if(confirmed) disconnectTelegram();
    };

    return {
      params,
      grids,
      allowedRoles,
      roleOptions,
      trainingLevelOptions,
      telegramData,
      save,
      confirmDeleteMember,
      confirmDisconnectTelegram,
      isUpdate,
      isSaving,
    };
  },

  components: { ClickToCopy, NxtSelect, NxtCheckbox, NxtModalSaveCancelFooter },
};
</script>

<style lang="scss">
.input-flexed {
  display: flex;
  align-items: center;
  column-gap: 8px;
}
</style>
