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
    <label for="phone">Phone</label>
    <div class="nxt-input-with-prefix">
      <span class="nxt-input-prefix text-bold">+</span>
      <input
        id="phone"
        type="tel"
        class="nxt-input"
        v-model="params.phone"
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

  <template v-if="!limited">
    <div class="nxt-form-row mt-1">
      <div class="nxt-form-column nxt-form-column--50">
        <label for="latitude">
          Latitude
        </label>
        <input
          id="latitude"
          type="number"
          class="nxt-input nxt-input--hide-spinner"
          v-model="params.latitude"
          inputmode="decimal"
          min="-90"
          max="90"
          step="any"
        />
      </div>
      <div class="nxt-form-column nxt-form-column--50">
        <label for="longitude">
          Longitude
        </label>
        <input
          id="longitude"
          type="number"
          class="nxt-input nxt-input--hide-spinner"
          v-model="params.longitude"
          inputmode="decimal"
          min="-180"
          max="180"
          step="any"
        />
      </div>
    </div>

    <nxt-checkbox
      class="mt-1"
      label="Hidden from reporting"
      v-model="params.is_hidden_from_reporting"
    />

    <nxt-button
      v-if="isUpdate"
      type="button"
      size="small"
      variant="danger"
      :icon-svg="mdiTrashCanOutline"
      class="mt-2"
      @click="confirmDeleteCustomer"
      :disabled="!canDelete || isSaving"
    >
      Delete customer
    </nxt-button>
    <p
      v-if="isUpdate && !canDelete"
      class="text-small mt-0-half"
    >
      Can't delete customers with meters assigned
    </p>
  </template>

  <nxt-modal-save-cancel-footer :is-disabled="isSaving" />
</form>
</template>

<script>
import { ref, reactive } from 'vue';
import { isNil } from 'ramda';
import { useToast } from 'vue-toastification';
import { useNxtModal } from '@nxt/components/NxtModal';
import { restRepo } from '@/repo/restRepo';
import { prepPhoneForEdit, prepPhoneForSave } from '@nxt/libraries/phone-helpers';
import { NIGERIA_PHONE_PATTERN } from '@nxt/libraries/constants';

import { NxtCheckbox } from '@nxt/components/form';
import { NxtModalSaveCancelFooter } from '@nxt/components';
import { mdiTrashCanOutline } from '@mdi/js';

const normalizePhoneEntry = phone => {
  if(isNil(phone)) return phone;
  const trimmedPhone = phone.trim();
  if(!trimmedPhone) return null;
  return trimmedPhone;
};

export default {
  setup() {
    const modal = useNxtModal();
    const toast = useToast();

    const { grid_id, customer, canDelete } = modal.data;

    const isUpdate = !!customer;
    const isSaving = ref(false);

    const params = reactive({
      full_name: customer?.full_name ?? '',
      phone: customer?.phone ? prepPhoneForEdit(customer.phone) : '',
      email: customer?.email ?? '',
      latitude: customer?.latitude ?? null,
      longitude: customer?.longitude ?? null,
      is_hidden_from_reporting: customer?.is_hidden_from_reporting ?? false,
    });

    const doSave = () => {
      const normalizedPhone = normalizePhoneEntry(params.phone);
      // We only test when something is actually entered in the phone field
      if(normalizedPhone && !NIGERIA_PHONE_PATTERN.test(normalizedPhone)) {
        toast.warning('Invalid: Phone number should be a valid Nigerian phone number');
        return;
      }
      const phone = prepPhoneForSave(normalizedPhone);
      const email = params.email.length ? params.email : null;

      isSaving.value = true;
      if(isUpdate) {
        restRepo
          .updateCustomer({
            id: customer.id,
            full_name: params.full_name,
            phone,
            email,
            latitude: params.latitude,
            longitude: params.longitude,
            is_hidden_from_reporting: params.is_hidden_from_reporting,
          })
          .then(res => {
            toast.success('Updated customer ' + params.full_name);
            modal.done(res);
          })
          .catch(err => {
            const title = 'Error updating customer';
            console.error(title, err);
            toast.error(`${ title }: ${ err.message }`);
          })
          .finally(() => {
            isSaving.value = false;
          })
        ;
      }
      else {
        restRepo
          .createCustomer({
            full_name: params.full_name,
            phone,
            email,
            latitude: params.latitude,
            longitude: params.longitude,
            is_hidden_from_reporting: params.is_hidden_from_reporting,
            grid_id,
          })
          .then(res => {
            toast.success('Created customer ' + params.full_name);
            modal.done(res);
          })
          .catch(err => {
            const title = 'Error creating customer';
            console.error(title, err);
            toast.error(`${ title }: ${ err.message }`);
          })
          .finally(() => {
            isSaving.value = false;
          })
        ;
      }
    };

    const deleteCustomer = async () => {
      if(!canDelete) return;
      isSaving.value = true;
      const deletedCustomer = await restRepo.deleteAccount({ id: customer.id, type: 'CUSTOMER' });
      isSaving.value = false;
      toast.success(`Removed customer ${ deletedCustomer.full_name }.`);
      modal.done({ redirect: true });
    };

    const confirmDeleteCustomer = () => {
      const confirmed = confirm(`Are you sure you want to remove ${ customer.full_name }'s account?`);
      if(confirmed) deleteCustomer();
    };

    return {
      limited: modal.props.limited,
      params,
      canDelete,
      doSave,
      confirmDeleteCustomer,
      isUpdate,
      isSaving,
      mdiTrashCanOutline,
    };
  },

  components: { NxtCheckbox, NxtModalSaveCancelFooter },
};
</script>
