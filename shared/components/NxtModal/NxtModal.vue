<template>
<Transition name="modal-scale">
  <use-focus-trap
    v-if="isOpen"
    class="nxt-modal-trap"
    :options="{ allowOutsideClick: true }"
  >
    <aside
      class="nxt-modal"
      role="dialog"
      aria-modal="true"
    >
      <h3 class="nxt-modal__title">
        {{ options?.props?.header || '&nbsp;' }}
      </h3>
      <div class="nxt-modal__body">
        <component :is="component" />
        <button
          class="nxt-modal__close nxt-icon-btn with-any-focus-padded"
          @click="close"
        >
          <mdi-icon :icon="mdiClose"/>
        </button>
      </div>
    </aside>
  </use-focus-trap>
</Transition>

<transition name="fade-simple">
  <div
    v-if="isOpen"
    @click="close"
    class="full-screen-cover nxt-modal-cover"
  ></div>
</transition>
</template>

<script>
import { useNxtModal } from './';
import { useRoute } from 'vue-router';
import { mdiClose } from '@mdi/js';
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component';
import { watch } from 'vue';

export default {
  setup() {
    const route = useRoute();
    const { isOpen, component, options, close } = useNxtModal();

    const onKeyUp = ({ key }) => {
      if(key === 'Escape') close();
    };

    watch(isOpen, isOpen => {
      if(isOpen) document.addEventListener('keyup', onKeyUp);
      else document.removeEventListener('keyup', onKeyUp);
    });

    // Close modal on route
    watch(() => route.name, close);

    return { mdiClose, isOpen, component, options, close };
  },

  components: { UseFocusTrap },
};
</script>

<style lang="scss">
.nxt-modal-trap {
  position: fixed;
  display: flex;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(1);
  width: 92%;
  max-width: 416px;
  max-height: 90%;
  z-index: 902;
}

.nxt-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-block: 1.5rem 1rem;
  border-radius: 2px;
  background-color: $nxt-color-white;
  box-shadow: 0 1px 3px #0000004d;

  &__title {
    font-size: 1.25rem;
    line-height: 1;
    font-weight: 700;
    margin-bottom: 1rem;
    padding-right: 40px;
    margin-inline: 24px;
  }

  &__body {
    overflow-y: auto;
    padding-inline: 24px;
    padding-bottom: 0.5rem;
  }

  &__close {
    position: absolute;
    top: 18px;
    right: 24px;
  }
}

.nxt-modal-footer {
  display: flex;
  justify-content: flex-end;
  column-gap: 8px;
  margin-top: 2rem;
}

.nxt-modal-cover {
  z-index: 901;
}

.modal-scale {
  &-enter-active {
    transition: transform 300ms $ease--out-back;
  }
  &-leave-active {
    transition: transform 300ms $ease--in-back;
  }

  &-enter-from,
  &-leave-to {
    transform: translate(-50%, -50%) scale(0);
  }
}
</style>
