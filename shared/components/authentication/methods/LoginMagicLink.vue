<template>
<template v-if="!magicLinkSent">
  <p class="p mb-2">A magic link will be sent to your email address. Clicking that link will log you in to our system.</p>
  <form @submit.prevent="sendMagicLink">
    <div class="nxt-form-column nxt-form-float-label">
      <input
        id="email"
        type="email"
        class="nxt-input nxt-input--large"
        :class="{ 'nxt-input--filled': email.length }"
        v-model="email"
        required
      />
      <label for="email">
        Email
      </label>
    </div>
    <div class="flex-right mt-2">
      <nxt-button
        type="submit"
        variant="primary"
      >
        Send Magic Link
      </nxt-button>
    </div>
  </form>
</template>
<p v-else class="p">A magic link has been sent to your email address. Please click that link to log in.</p>
</template>

<script>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { storeToRefs } from 'pinia';

export default {
  setup() {
    const router = useRouter();
    const $toast = useToast();

    const magicLinkSent = ref(false);
    const email = ref('');

    const { isLoggedIn } = storeToRefs(useAccountStore());

    const sendMagicLink = () => {
      baseSupabaseRepo
        .loginWithMagicLink(email.value)
        .then(() => {
          magicLinkSent.value = true;
          // Watch store for changes and route when logging in
          watch(isLoggedIn, (newVal, oldVal) => {
            if(!oldVal && newVal) router.push({ path: '/' });
          });
        })
        .catch(err => {
          const title = 'Error sending Magic Link';
          console.error(title, err);
          $toast.error(`${ title }: ${ err.message }`);
        })
      ;
    };

    return { magicLinkSent, email, sendMagicLink };
  },
};
</script>
