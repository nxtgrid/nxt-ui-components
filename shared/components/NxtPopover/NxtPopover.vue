<template>
<slot
  name="trigger"
  :togglePopover="doToggle"
  :uid="triggerId"
  :isVisible="isVisible"
/>
<Teleport to="body">
  <Transition name="popover-scale">
    <!-- We create (v-if) the element first so its position can be calculated,
      but wait for the computed classes and styles (v-show) to be ready before showing it -->
    <div
      v-if="isVisible"
      v-show="floatingClass"
      ref="floatingEl"
      class="nxt-popover"
      :class="floatingClass"
      role="dialog"
      aria-modal="true"
      :style="floatingStyle"
    >
      <slot :closePopover="doClose" />
      <button
        v-if="showCloseButton"
        class="nxt-popover__close nxt-icon-btn nxt-icon-btn--tiny with-any-focus-tight"
        @click="doClose"
      >
        <mdi-icon :scale="16" :icon="mdiClose"/>
      </button>
      <div
        v-if="hasArrow"
        ref="arrowEl"
        class="nxt-popover__arrow"
        :style="arrowStyle"
      ></div>
    </div>
  </Transition>
</Teleport>
</template>

<script>
import { ref, getCurrentInstance, watch, nextTick, onBeforeUnmount } from 'vue';
import { computePosition, autoUpdate, offset, flip, shift, hide, arrow } from '@floating-ui/dom';
import { onClickOutside } from '@vueuse/core';
import { mdiClose } from '@mdi/js';

export default {
  props: {
    placement: {
      type: String,
      default: 'bottom',
    },
    containerEl: {
      type: HTMLElement,
    },
    showCloseButton: {
      type: Boolean,
      default: false,
    },
    offset: {
      type: Number,
      default: 8,
    },
    hasArrow: {
      type: Boolean,
      default: false,
    },
    padding: {
      type: String,
      default: '1rem 16px',
    },
    zIndex: {
      type: String,
      default: '5',
    },
  },

  emits: [ 'open', 'close' ],

  setup(props, ctx) {
    const floatingEl = ref();
    const floatingStyle = ref();
    const floatingClass = ref();
    const arrowEl = ref();
    const arrowStyle = ref();
    const triggerId = 'nxt-popover-trigger-' + getCurrentInstance().uid;
    const isVisible = ref(false);

    const doOpen = () => {
      ctx.emit('open');
      isVisible.value = true;
    };
    const doClose = () => {
      ctx.emit('close');
      isVisible.value = false;
    };
    const doToggle = () => {
      if(!isVisible.value) doOpen();
      else doClose();
    };
    const onKeyUp = ({ key }) => {
      if(key === 'Escape') doClose();
    };

    let cleanup;

    const doPosition = () => {
      const referenceEl = document.getElementById(triggerId);
      const flipShiftSettings = props.containerEl ? { boundary: props.containerEl } : {};
      const cleanupFloatingUi = autoUpdate(referenceEl, floatingEl.value, () => {
        computePosition(referenceEl, floatingEl.value, {
          placement: props.placement,
          strategy: 'fixed',
          middleware: [
            offset(props.offset),
            flip(flipShiftSettings),
            shift(flipShiftSettings),
            props.hasArrow && arrow({ element: arrowEl.value }),
            hide(),
          ],
        })
          .then(({ x, y, placement, middlewareData }) => {
            const staticSide = {
              top: 'bottom',
              right: 'left',
              bottom: 'top',
              left: 'right',
            }[placement.split('-')[0]];
            const xTransform = [ 'left', 'right' ].includes(staticSide) ? staticSide : '50%';
            const yTransform = [ 'top', 'bottom' ].includes(staticSide) ? staticSide : '50%';

            floatingClass.value = `popover-scale--${ yTransform !== '50%' ? 'vertical' : 'horizontal' }`;

            floatingStyle.value = {
              left: `${ x }px`,
              top: `${ y }px`,
              visibility: middlewareData.hide?.referenceHidden ? 'hidden' : 'visible',
              'transform-origin': `${ xTransform } ${ yTransform }`,
              padding: props.padding,
              'z-index': props.zIndex,
            };
            if(middlewareData.arrow) {
              const { x, y } = middlewareData.arrow;

              arrowStyle.value = {
                left: x != null ? `${ x }px` : '',
                top: y != null ? `${ y }px` : '',
                right: '',
                bottom: '',
                [staticSide]: '-6px',
              };
            }
          });
      });
      const stopListening = onClickOutside(
        floatingEl,
        doClose,
        { ignore: [ `#${ triggerId }` ], ignoreDrag: true },
      );
      cleanup = () => {
        stopListening();
        cleanupFloatingUi();
      };
    };

    watch(isVisible, isVisible => {
      if(isVisible) {
        nextTick(doPosition);
        document.addEventListener('keyup', onKeyUp);
      }
      else {
        cleanup && cleanup();
        document.removeEventListener('keyup', onKeyUp);
      }
    });

    onBeforeUnmount(() => {
      cleanup && cleanup();
      document.removeEventListener('keyup', onKeyUp);
    });

    return { mdiClose, floatingEl, floatingStyle, floatingClass, arrowEl,  arrowStyle, triggerId, isVisible, doClose, doToggle };
  },
};
</script>

<style lang="scss">
.nxt-popover {
  position: fixed;
  width: max-content;
  top: 0;
  left: 0;
  background-color: $nxt-color-white;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 30%);

  &__close {
    position: absolute;
    top: 0px;
    right: 0px;
  }

  &__arrow {
    position: absolute;
    background: $nxt-color-white;
    width: 16px;
    height: 16px;
    transform: rotate(45deg);
  }
}

.popover-scale {
  &-enter-active {
    transition: transform 300ms $ease--out-expo;
  }
  &-leave-active {
    transition: transform 200ms $ease--in-expo;
  }

  &-enter-from,
  &-leave-to {
    &.popover-scale--horizontal {
      transform: scaleX(0)
    }
    &.popover-scale--vertical {
      transform: scaleY(0);
    }
  }
}
</style>
