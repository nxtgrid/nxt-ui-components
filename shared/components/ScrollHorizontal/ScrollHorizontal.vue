<template>
<div
  v-if="state.isScrollable"
  class="scroll-horizontal"
>
  <slot />
  <!-- <div class="scroll-arrow-left">
    <mdi-icon :scale="18" :icon="mdiChevronLeft" />
  </div> -->
  <div
    v-if="!state.hasScrolled"
    class="scroll-arrow-right"
    @click="scrollToEnd"
  >
    <mdi-icon :scale="18" :icon="mdiChevronRight" />
  </div>
</div>
<slot v-else />
</template>

<script>
import { reactive, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { /* mdiChevronLeft, */ mdiChevronRight } from '@mdi/js';

const isScrollable = $el => {
  const hasScrollableContent = $el.scrollWidth > $el.clientWidth;

  const overflowXStyle = window.getComputedStyle($el).overflowX;
  const isOverflowHidden = overflowXStyle.indexOf('hidden') !== -1;

  return hasScrollableContent && !isOverflowHidden;
};

export default {
  props: {
    el: {
      type: Object,
    },
  },

  setup(props) {
    const state = reactive({
      isScrollable: false,
      hasScrolled: false,
    });

    const updateState = () => {
      state.isScrollable = isScrollable(props.el);
    };

    const onResize = useDebounceFn(updateState, 100);

    let _cachedEl;
    // let _cachedChildren;

    const cleanCache = () => {
      _cachedEl?.removeEventListener('scroll', onScroll);
      _cachedEl = undefined;
      // _cachedChildren?.forEach(el => {
      //   el.removeEventListener('click', onChildClick);
      // });
      // _cachedChildren = undefined;
    };

    const onScroll = () => {
      state.hasScrolled = true;
      cleanCache();
    };

    // const onChildClick = ({ currentTarget }) => {
    //   currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    // };

    watch(() => state.isScrollable, isScrollable => {
      if(isScrollable) {
        nextTick(() => {
          _cachedEl = props.el;
          _cachedEl.addEventListener('scroll', onScroll);
          // _cachedChildren = [ ...props.el.children ];
          // _cachedChildren.forEach(el => {
          //   el.addEventListener('click', onChildClick);
          // });
        });
      }
      else cleanCache();
    });

    const scrollToEnd = () => {
      _cachedEl?.scroll({ left: _cachedEl.scrollWidth, behavior: 'smooth' });
    };

    onMounted(() => {
      nextTick(() => {
        updateState();
        window.addEventListener('resize', onResize);
      });
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
      cleanCache();
    });

    return { state, scrollToEnd, /* mdiChevronLeft, */ mdiChevronRight };
  },
};
</script>

<style lang="scss">
.scroll-horizontal {
  position: relative;

  & > *:first-child{
    @include no-scrollbars;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;

    > * {
      scroll-snap-align: start;
    }
  }
}

.scroll-arrow-right {
  // pointer-events: none;
  position: absolute;
  display: flex;
  align-items: center;
  top: 0;
  height: 100%;
  width: 28px;
  color: rgba($nxt-color-font-dark, 0.75); // @TODO :: Make without opacity
  cursor: pointer;
}

.scroll-arrow-right {
  left: 100%;
  margin-left: -14px;
  justify-content: flex-end;
  background: linear-gradient(to right, rgba($nxt-color-blue-bright, 0), $nxt-color-blue-bright 50%);
}
</style>
