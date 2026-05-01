<template>
<section
  class="card"
  v-if="myProfile && accountMeta"
>
  <header class="card-header">
    <h2 class="h2 flex-horizontal">
      {{ myProfile.full_name }}
      <nxt-button
        title="Edit name"
        size="small"
        icon-only
        :icon-svg="mdiPencilOutline"
        @click="openUpdateAccountModal({ property: 'full_name', prettyName: 'name', value: myProfile.full_name })"
      />
    </h2>
    <nxt-button
      title="Log out"
      class="pull-right"
      :icon-svg="mdiLogout"
      variant="tertiary"
      size="small"
      @click="accountStore.doLogOut()"
    >
      Log out
    </nxt-button>
  </header>
  <dl class="details-list">
    <dt>Organization</dt>
    <dd>{{ myProfile.organization?.name }}</dd>
    <dt>Member since</dt>
    <dd>{{ new Date(accountMeta.created_at).toLocaleDateString() }} ({{ timeAgo(accountMeta.created_at) }})</dd>
    <dt>Email</dt>
    <dd>
      {{ myProfile.email }}
      <nxt-button
        title="Edit email address"
        size="small"
        icon-only
        :icon-svg="mdiPencilOutline"
        @click="openUpdateAccountModal({ property: 'email', value: myProfile.email })"
      />
    </dd>
    <dt>Phone</dt>
    <dd>
      {{ formatPhone(myProfile.phone) }}
      <nxt-button
        title="Edit phone number"
        size="small"
        icon-only
        :icon-svg="mdiPencilOutline"
        @click="openUpdateAccountModal({ property: 'phone', value: prepPhoneForEdit(myProfile.phone) })"
      />
    </dd>
    <template v-if="telegramConnected">
      <dt>
        Telegram
      </dt>
      <dd>
        Connected
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
    <dt>Training level</dt>
    <dd>{{ TRAINING_LEVEL_MAP[trainingLevel] }}</dd>
    <dt>Using Sphinx for</dt>
    <dd>{{ myProfile.busy_commissioning?.name }}</dd>
  </dl>
</section>
<section class="card mt-1">
  <header class="card-header">
    <h2 class="h2">
      App settings
    </h2>
  </header>
  <div class="nxt-form-column">
    <label for="table-entries">
      Default number of table entries
    </label>
    <input
      id="table-entries"
      type="number"
      class="nxt-input"
      v-model="tableNumRows"
      min="1"
      style="max-width: 220px"
    />
  </div>
</section>
</template>

<script>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { useNxtModal } from '@nxt/components/NxtModal';
import { useTablePreferencesStore } from '@nxt/components/table';
import { timeAgo } from '@nxt/libraries/date-helpers';
import { formatPhone, prepPhoneForEdit } from '@nxt/libraries/phone-helpers';
import { TRAINING_LEVEL_MAP } from '@nxt/libraries/format-maps';
import { mdiLogout, mdiPencilOutline } from '@mdi/js';

import UpdateAccountModal from '@nxt/components/modals/UpdateAccountModal/UpdateAccountModal.vue';
import ClickToCopy from '@nxt/components/ClickToCopy/ClickToCopy.vue';

export default {
  setup() {
    const accountStore = useAccountStore();
    const nxtModal = useNxtModal();
    const tablePreferencesStore = useTablePreferencesStore();
    const { myProfile, trainingLevel } = storeToRefs(accountStore);
    const accountMeta = ref();
    const telegramConnected = computed(() => !!accountMeta.value.telegram_id);
    const telegramCopyLink = computed(() => `${ import.meta.env.VITE_TELEGRAM_BOT_URL }?start=${ accountMeta.value.telegram_link_token }`);

    baseSupabaseRepo.client
      .from('accounts')
      .select('created_at, telegram_id, telegram_link_token')
      .eq('id', myProfile.value.id)
      .maybeSingle()
      .then(baseSupabaseRepo.handleResponse)
      .then(data => {
        accountMeta.value = data;
      })
    ;

    const openUpdateAccountModal = data => {
      nxtModal.open(UpdateAccountModal, {
        props: {
          header: `Update account ${ data.prettyName ?? data.property }`,
        },
        data,
        onDone: accountStore.fetchMyProfile,
      });
    };

    const tableNumRows = computed({
      get() {
        return tablePreferencesStore.numRows;
      },
      set(newVal) {
        tablePreferencesStore.setNumRows(newVal || 1);
      },
    });

    return { myProfile, trainingLevel, accountStore, accountMeta, telegramConnected, telegramCopyLink, openUpdateAccountModal, tableNumRows, timeAgo, formatPhone, prepPhoneForEdit, TRAINING_LEVEL_MAP, mdiLogout, mdiPencilOutline };
  },

  components: { ClickToCopy },
};
</script>
