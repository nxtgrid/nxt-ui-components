<template>
<div>
  <slot></slot>
</div>
</template>

<script>
export default {
  props: {
    exclusivity: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    closeAll() {
      this.$children.forEach(accordion => {
        accordion.closeMe();
      });
    },
  },

  mounted() {
    if(this.exclusivity) {
      this.$children.forEach(accordion => {
        // Add event listener to every accordion
        accordion.$on('change', el => {
          // Close every accordion except for one that emitted event
          this.$children
            .filter(x => x !== el)
            .forEach(x => x.closeMe && x.closeMe())
          ;
        });
      });
    }
  },
};
</script>
