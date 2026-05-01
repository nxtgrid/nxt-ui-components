<template>
<div
  class="login center-content"
  :class="{ 'login--modal': asModal }"
>
  <button
    v-if="asModal"
    class="login-close with-any-focus-padded"
    @click="$emit('close')"
  >
    <mdi-icon :icon="mdiClose" />
  </button>
  <div class="login__content">
    <img
      v-if="brand"
      :src="`/branding/${ brand.folder }/logo.png`"
      :alt="brand.name + ' logo'"
      class="login__logo login__logo--branded"
    />
    <nxt-logo v-else class="login__logo" />
    <h2 class="h1-thin">
      Welcome back
    </h2>

    <div class="method-switcher">
      <nxt-button
        v-for="_method in methods"
        :key="_method.method"
        :title="_method.title"
        :icon-svg="_method.icon"
        :class="{ 'method-switch--active': method === _method.method }"
        @click="method = _method.method"
        size="small"
        icon-only
        variant="primary"
      />
      <login-google />
    </div>

    <login-password
      v-if="method === 'PASSWORD'"
      @success="onLogin"
      @close="$emit('close')"
    />
    <login-sms v-if="method === 'SMS'" @success="onLogin"/>
    <login-magic-link v-if="method === 'MAGIC_LINK'" />
  </div>
</div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '@nxt/libraries/api-connection/store/account';
import { storeToRefs } from 'pinia';
import { mdiClose, mdiFormTextboxPassword, mdiCellphoneMessage, mdiMagicStaff } from '@mdi/js';

import NxtLogo from '../NxtLogo/NxtLogo.vue';
import LoginPassword from './methods/LoginPassword.vue';
import LoginSms from './methods/LoginSms.vue';
import LoginMagicLink from './methods/LoginMagicLink.vue';
import LoginGoogle from './methods/LoginGoogle.vue';

export default {
  props: {
    asModal: {
      type: Boolean,
      default: false,
    },
  },

  emits: [ 'success', 'close' ],

  setup(props, ctx) {
    const router = useRouter();
    const accountStore = useAccountStore();
    const { brand } = storeToRefs(accountStore);

    const method = ref('PASSWORD');
    const methods = [
      {
        method: 'PASSWORD',
        title: 'Log in with email and password',
        icon: mdiFormTextboxPassword,
      },
      {
        method: 'SMS',
        title: 'Log in with One Time Password sent via SMS',
        icon: mdiCellphoneMessage,
      },
      {
        method: 'MAGIC_LINK',
        title: 'Log in with a Magic Link sent to your email address',
        icon: mdiMagicStaff,
      },
    ];

    const onLogin = () => {
      ctx.emit('success');
      if(!props.asModal)  {
        router.push(accountStore.redirectAfterLogin ?? '/');
        accountStore.setRedirectAfterLogin(null);
      }
    };

    return { brand, method, methods, onLogin, mdiClose };
  },

  components: { NxtLogo, LoginPassword, LoginSms, LoginMagicLink, LoginGoogle },
};
</script>

<style lang="scss">
.login {
  position: fixed;
  height: 100%;
  top: 0;
  left: 0;
  background-color: $nxt-color-blue-bright;
  z-index: $z-login;

  &__content {
    position: relative;
    width: 92%;
    max-width: 460px;
  }

  &__logo {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 140px;
    height: auto;
    margin-bottom: 1.25rem;
    z-index: -1;
    opacity: 0.1;

    &--branded {
      opacity: 0.75;
    }

    @media(min-width: $ipad-vertical) {
      width: 160px;
      margin-bottom: 2rem;
    }
  }

  &--modal {
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.25);
  }
}

.login-close {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  padding: 16px;
  background: none;
  border: none;
  border-bottom-left-radius: 4px;

  transition: 0.2s ease-out;

  @media (hover: hover) {
    &:hover {
      opacity: 1;
      background-color: $nxt-color-background-light;
    }
  }
}

.password-link {
  display: block;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: $nxt-color-blue-highlight;
  text-align: right;
  text-decoration: none;
}

.method-switcher {
  display: flex;
  column-gap: 8px;
  margin-top: 0.5rem;
  margin-bottom: 2rem;

  color: $nxt-color-blue;
}

.method-switch--active {
  color: $nxt-color-blue-highlight;
}
</style>
