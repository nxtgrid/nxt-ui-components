<template>
<p v-if="property === 'phone'" class="p mb-1">
  Enter a valid phone number with country code, omitting the initial '+' or '00'
</p>
<p v-if="property === 'email'" class="p mb-1">
  If you change your email address, a confirmation will be sent to both the new <em>and the old</em> address.
  <br><br>
  You will need to click the confirmation link in both emails for the change to be completed.
</p>
<form @submit.prevent="doUpdate">
  <div class="nxt-form-column">
    <label for="edit-item" style="text-transform: capitalize;">
      {{ prettyName ?? property }}
    </label>
    <div :class="{ 'nxt-input-with-prefix': property === 'phone' }">
      <span v-if="property === 'phone'" class="nxt-input-prefix text-bold">+</span>
      <input
        id="edit-item"
        :type="property === 'email' ? 'email' : property === 'phone' ? 'tel' : 'text'"
        class="nxt-input"
        v-model="updateValue"
      />
    </div>
  </div>
  <nxt-modal-save-cancel-footer
    :is-disabled="!hasChanges || isUpdating"
  />
</form>
</template>

<script>
import { computed, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useNxtModal } from '@nxt/components/NxtModal';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';

import NxtModalSaveCancelFooter from '@nxt/components/NxtModal/NxtModalSaveCancelFooter.vue';

const emptyStringToNull = val => val?.length ? val : null;

export default {
  setup() {
    const modal = useNxtModal();
    const toast = useToast();

    const { property, prettyName, value } = modal.data;
    const updateValue = ref(value ?? '');
    const isUpdating = ref(false);

    const hasChanges = computed(() => emptyStringToNull(updateValue.value) !== value);

    const doUpdate = () => {
      if(!hasChanges.value) return;
      isUpdating.value = true;
      const valueToUse = emptyStringToNull(updateValue.value);
      // Email and phone are directly on the user object, the rest is (meta)data
      const updateObj = [ 'email', 'phone' ].includes(property) ?
        { [property]: valueToUse } :
        { data: { [property]: valueToUse } }
      ;
      baseSupabaseRepo
        .updateUser(updateObj)
        .then(() => {
          toast.success(`Successfully updated ${ property }`);
          modal.done();
        })
        .catch(err => {
          const title = `Error updating ${ property }`;
          console.error(title, err);
          toast.error(`${ title }: ${ err.message }`);
        })
        .finally(() => {
          isUpdating.value = false;
        })
      ;
    };

    return { property, prettyName, updateValue, isUpdating, hasChanges, doUpdate };
  },

  components: { NxtModalSaveCancelFooter },
};
</script>
