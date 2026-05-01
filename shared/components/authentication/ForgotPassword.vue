<template>
<div>
  <h2 class="h1-thin">
    Reset password
  </h2>
  <form
    v-if="!postSubmitMessage"
    @submit.prevent="doSubmit"
    class="mt-2"
  >
    <div class="nxt-form-column">
      <label for="resetemail">Email address</label>
      <input
        id="resetemail"
        type="email"
        class="nxt-input nxt-input--large"
        v-model="email"
        required
      />
    </div>
    <div class="flex-right mt-3">
      <nxt-button
        type="submit"
        variant="primary"
      >
        Reset password
      </nxt-button>
    </div>
  </form>
  <p v-else class="p mt-1">
    {{ postSubmitMessage }}
  </p>
</div>
</template>

<script>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const email = ref(route.query.email ?? '');
    const postSubmitMessage = ref('');

    const { isLoggedIn } = storeToRefs(useAccountStore());

    const doSubmit = () => {
      if(!email.value) return;
      const redirectTo = window.location.origin +  '/account/reset-password';
      baseSupabaseRepo
        .resetPassword(email.value, { redirectTo })
        .then(() => {
          postSubmitMessage.value = `A password reset link was sent to ${ email.value }.`;
          // Watch store for changes and route when logging in
          watch(isLoggedIn, (newVal, oldVal) => {
            if(!oldVal && newVal) router.push({ path: '/' });
          });
        })
        .catch(err => {
          console.error(err);
          postSubmitMessage.value = `Something went wrong trying to reset your password: ${ err.message }`;
        })
      ;
    };

    return { email, doSubmit, postSubmitMessage };
  },
};
</script>
