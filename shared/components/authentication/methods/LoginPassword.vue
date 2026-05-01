<template>
<form @submit.prevent="doLogin">
  <div class="nxt-form-column nxt-form-float-label">
    <input
      id="email"
      type="email"
      required
      class="nxt-input nxt-input--large"
      :class="{ 'nxt-input--filled': credentials.email.length }"
      v-model="credentials.email"
    />
    <label for="email">
      Email
    </label>
  </div>
  <div class="nxt-form-column nxt-form-float-label mt-2">
    <input
      id="password"
      :type="showPassword ? 'text' : 'password'"
      required
      class="nxt-input nxt-input--large"
      :class="{ 'nxt-input--filled': credentials.password.length }"
      v-model="credentials.password"
    />
    <label for="password">
      Password
    </label>
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
  <router-link
    :to="{
      path: '/account/forgot-password',
      query: { email: credentials.email },
    }"
    @click="$emit('close')"
    class="password-link"
  >
    Forgot password?
  </router-link>
  <div class="flex-right mt-2">
    <nxt-button
      type="submit"
      variant="primary"
      :is-loading="isLoggingIn"
      :disabled="isLoggingIn"
    >
      Log in
    </nxt-button>
  </div>
</form>
</template>

<script>
import { ref, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js';

export default {
  emits: [ 'success', 'close' ],

  setup(_props, ctx) {
    const $toast = useToast();

    const credentials = reactive({
      email: '',
      password: '',
    });

    const isLoggingIn = ref(false);
    const showPassword = ref(false);

    const doLogin = () => {
      isLoggingIn.value = true;
      baseSupabaseRepo
        .loginWithPassword(credentials)
        .then(() => {
          ctx.emit('success');
        })
        .catch(err => {
          const title = 'Error logging in';
          console.error(title, err);
          $toast.error(`${ title }: ${ err.message }`);
          isLoggingIn.value = false;
        })
      ;
    };

    return { credentials, isLoggingIn, showPassword, doLogin, mdiEyeOutline, mdiEyeOffOutline };
  },
};
</script>
