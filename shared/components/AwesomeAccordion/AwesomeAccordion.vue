<template>
<transition
  @before-enter="beforeEnter"
  @enter="enter"
  @after-enter="reset"
  @before-leave="beforeLeave"
  @leave="leave"
  @after-leave="reset"
>
  <div class="accordion-content" v-if="isOpen">
    <slot />
  </div>
</transition>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const beforeEnter = el => {
      el.style.height = '0';
    };

    const enter = el => {
      el.style.height = el.scrollHeight + 'px';
    };

    const beforeLeave = el => {
      el.style.height = el.scrollHeight + 'px';
    };

    const leave = el => {
      // requestAnimationFrame(() => {
      el.style.height = '0';
      // });
    };

    const reset = el => {
      el.style.height = '';
    };

    return { beforeEnter, enter, beforeLeave, leave, reset };
  },
};
</script>

<style lang="scss">
.accordion-content {
  transition: height 300ms $ease--smooth-fade;
  overflow: hidden;
}
</style>
