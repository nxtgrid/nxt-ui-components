<template>
<p class="p mb-2">A one time password will be sent to your phone. You can enter that password in the next step to log in.</p>
<form
  v-if="!otpSent"
  @submit.prevent="sendOtp"
>
  <div class="nxt-form-column nxt-form-float-label">
    <input
      id="phone"
      type="phone"
      class="nxt-input nxt-input--large"
      :class="{ 'nxt-input--filled': phone.length }"
      v-model="phone"
      required
    />
    <label for="phone">
      Phone number
    </label>
  </div>
  <div class="flex-right mt-2">
    <nxt-button
      type="submit"
      variant="primary"
    >
      Send SMS
    </nxt-button>
  </div>
</form>
<form
  v-else
  @submit.prevent="submitOtp"
>
  <div class="nxt-form-column nxt-form-float-label">
    <input
      id="otp"
      class="nxt-input nxt-input--large"
      :class="{ 'nxt-input--filled': otp.length }"
      v-model="otp"
      minlength="6"
      maxlength="6"
      required
    />
    <label for="otp">
      One time password
    </label>
  </div>
  <div class="flex-right mt-2">
    <nxt-button
      type="submit"
      variant="primary"
    >
      Submit Password
    </nxt-button>
  </div>
</form>
</template>

<script>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';

export default {
  emits: [ 'success' ],

  setup(_props, ctx) {
    const $toast = useToast();

    const otpSent = ref(false);
    const phone = ref('');
    const otp = ref('');

    const sendOtp = () => {
      baseSupabaseRepo
        .loginWithSms(phone.value)
        .then(() => {
          otpSent.value = true;
        })
        .catch(err => {
          const title = 'Error sending SMS';
          console.error(title, err);
          $toast.error(`${ title }: ${ err.message }`);
        })
      ;
    };

    const submitOtp = () => {
      baseSupabaseRepo
        .verifySmsOtp(phone.value, otp.value)
        .then(() => {
          ctx.emit('success');
        })
        .catch(err => {
          const title = 'Error verifying OTP';
          console.error(title, err);
          $toast.error(`${ title }: ${ err.message }`);
        })
      ;
    };

    return { otpSent, phone, otp, sendOtp, submitOtp };
  },
};
</script>
