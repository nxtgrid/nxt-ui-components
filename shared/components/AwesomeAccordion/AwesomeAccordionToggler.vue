<template>
<div class="accordion-wrapper" :class="{ 'active': isOpenUsed }">
  <div class="accordion-header" ref="accordion-header">
    <slot name="accordion-header"></slot>
  </div>
  <transition
    @before-enter="beforeEnter"
    @enter="enter"
    @before-leave="beforeLeave"
    @leave="leave"
  >
    <div class="accordion-content" v-if="isOpenUsed">
      <div class="accordion-content-inner">
        <slot name="accordion-content"></slot>
      </div>
    </div>
  </transition>
</div>
</template>

<script>
export default {
  props: {
    startsOpen: {
      type: Boolean,
      default: false,
    },
    useExternalToggle: {
      type: Boolean,
      default: false,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      internalIsOpen: false,
      clickAbles: [],
    };
  },

  methods: {
    toggleMe() {
      this.internalIsOpen = !this.internalIsOpen;
      this.$emit('change', this);
    },

    closeMe() {
      this.internalIsOpen = false;
    },

    openMe() {
      this.internalIsOpen = true;
    },

    // Animation methods
    beforeEnter(el) {
      el.style.height = '0';
    },

    enter(el) {
      el.style.height = (el.scrollHeight + 15) + 'px';
    },

    beforeLeave(el) {
      el.style.height = (el.scrollHeight + 15) + 'px';
    },

    leave(el) {
      requestAnimationFrame(() => {
        el.style.height = '0';
      });
    },
  },

  computed: {
    isOpenUsed() {
      return this.useExternalToggle ? this.isOpen : this.internalIsOpen;
    },
  },

  created() {
    if(this.startsOpen) this.openMe();
  },

  mounted() {
    // We try to find any clickable (with ref="accordion-toggle") elements
    if(this.$slots['accordion-header']) {
      const elementArray = this.$slots['accordion-header'];
      this.clickables = deepSearchForToggles(elementArray)
        .map(el => el.elm)
      ;

      // If we don't find clickables, we just make it the entire header
      if(!this.clickables.length) {
        this.clickables.push(this.$refs['accordion-header']);
      }

      // Add click event listener to all clickables, responding with toggleMe
      this.clickables.forEach(el => {
        el.addEventListener('click', this.toggleMe);
      });
    }
  },

  unmounted() {
    // Clean up event listeners
    this.clickables.forEach(el => {
      el.removeEventListener('click', this.toggleMe);
    });
  },
};

function deepSearchForToggles(arr) {
  const foundElements = [];

  function recursiveSearch(_arr) {
    _arr.forEach(el => {
      if(el.data && el.data.ref === 'accordion-toggle') {
        foundElements.push(el);
      }
      if(el.children) {
        recursiveSearch(el.children);
      }
    });
  }

  recursiveSearch(arr);
  return foundElements;
}
</script>

<style lang="scss">
.accordion-content {
  transition: height 300ms $ease--smooth-fade;
  overflow: hidden;
}
</style>
