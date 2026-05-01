<template>
<div>
  <h2 class="h1-thin">
    <template v-if="isReset">
      Reset password
    </template>
    <template v-else>
      Welcome to NXT Grid. Please set your password
    </template>
  </h2>

  <div
    v-if="expiredMessage"
    class="card card--error mt-0-half"
  >
    <p class="p text-bold">
      {{ expiredMessage }}.
      <br>
      Please try the password reset process from the start.
      <br>
      <router-link
        to="/account/forgot-password"
        class="text-white"
      >
        Click here to go back
      </router-link>
    </p>
  </div>

  <form @submit.prevent="setPassword" class="mt-2">
    <div class="nxt-form-column">
      <label for="password">{{ isReset ? 'New p' : 'P' }}assword</label>
      <div style="position: relative;">
        <input
          id="password"
          :type="showPassword ? 'text' : 'password'"
          required
          class="nxt-input nxt-input--large"
          v-model="password"
        />
        <button
          type="button"
          class="nxt-input-password-eye with-any-focus-padded"
          @click="showPassword = !showPassword"
        >
          <mdi-icon
            v-if="showPassword"
            :icon="mdiEyeOffOutline"
            :scale="20"
          />
          <mdi-icon
            v-else
            :icon="mdiEyeOutline"
            :scale="20"
          />
        </button>
      </div>
    </div>
    <div class="nxt-form-column mt-1">
      <label for="repeatPassword">Repeat password</label>
      <div style="position: relative;">
        <input
          id="repeatPassword"
          :type="showRepeatPassword ? 'text' : 'password'"
          required
          class="nxt-input nxt-input--large"
          v-model="repeatPassword"
        />
        <button
          type="button"
          class="nxt-input-password-eye with-any-focus-padded"
          @click="showRepeatPassword = !showRepeatPassword"
        >
          <mdi-icon
            v-if="showRepeatPassword"
            :icon="mdiEyeOffOutline"
            :scale="20"
          />
          <mdi-icon
            v-else
            :icon="mdiEyeOutline"
            :scale="20"
          />
        </button>
      </div>
    </div>
    <div class="flex-right mt-3">
      <nxt-button
        type="submit"
        variant="primary"
      >
        Save
      </nxt-button>
    </div>
  </form>
</div>
</template>

<script>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { parse } from 'qs';
import { useToast } from 'vue-toastification';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const { isReset } = route.meta;
    const expiredMessage = ref();

    const checkForExpiry = async () => {
      if(route.hash) {
        // Supabase sends a querystring as a hash, so we parse
        // it manually (removing the initial '#' character)
        const errorObj = parse(route.hash.substring(1));
        if(errorObj.error) {
          expiredMessage.value = errorObj.error_description ?? 'The email link may have expired';
          return;
        }
      }

      const { data: { session } } = await baseSupabaseRepo.client.auth.getSession();
      if(!session) expiredMessage.value = 'The email link may have expired';
    };
    checkForExpiry();

    const password = ref('');
    const repeatPassword = ref('');
    const showPassword = ref(false);
    const showRepeatPassword = ref(false);

    const setPassword = () => {
      if(!password.value?.length) {
        toast.error('Please enter a password');
        return;
      }
      if (password.value !== repeatPassword.value) {
        toast.error('Passwords have to be equal');
        return;
      }

      baseSupabaseRepo
        .updateUser({ password: password.value })
        .then(() => {
          toast.success('Successfully set password');
          router.push({ path: '/' });
        })
        .catch(err => {
          const title = 'Something went wrong setting password';
          console.error(title, err);
          toast.error(`${ title }: ${ err.message }`);
        })
      ;
    };

    return { isReset, expiredMessage, password, repeatPassword, showPassword, showRepeatPassword, setPassword, mdiEyeOutline, mdiEyeOffOutline };
  },
};
</script>
