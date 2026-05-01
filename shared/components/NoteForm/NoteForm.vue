<template>
<form
  class="note-form mb-1"
  @submit.prevent="onSubmit"
>
  <input
    type="text"
    class="nxt-input note-form__input"
    v-model="message"
    placeholder="Add a new note"
  />
  <nxt-button
    title="Add note"
    type="submit"
    class="note-form__button"
    :icon-svg="mdiEmailFastOutline"
    icon-only
  />
</form>
</template>

<script>
import { useToast } from 'vue-toastification';
import { mdiEmailFastOutline } from '@mdi/js';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';

export default {
  props: {
    customerId: {
      type: Number,
    },
    connectionId: {
      type: Number,
    },
    meterId: {
      type: Number,
    },
    onSuccess: {
      type: Function,
    },
  },

  data: () => ({
    message: '',
  }),

  setup() {
    const toast = useToast();
    const accountStore = useAccountStore();
    return { toast, accountStore, mdiEmailFastOutline };
  },

  methods: {
    onSubmit() {
      if(!this.message.length) return;
      const { customerId, connectionId, meterId, onSuccess, message } = this;

      baseSupabaseRepo.client
        .from('notes')
        .insert({
          customer_id: customerId,
          connection_id: connectionId,
          meter_id: meterId,
          author_id: this.accountStore.myProfile.id,
          message,
        })
        .then(baseSupabaseRepo.handleResponse)
        .then(() => {
          this.message = '';
          onSuccess && onSuccess();
        })
        .catch(err => {
          const title = 'Failed to create note';
          console.error(title, err);
          this.toast.error(`${ title }: ${ err.message }`);
        })
      ;
    },
  },
};
</script>

<style lang="scss">
.note-form {
  display: flex;

  &__input.nxt-input {
    flex-grow: 1;
    border-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &__button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
