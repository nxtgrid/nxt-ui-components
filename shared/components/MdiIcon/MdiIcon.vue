<template>
<svg
  :width="scale"
  :height="scale"
  viewBox="0 0 24 24"
>
  <path :d="iconToUse" />
</svg>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
    },
    icon: {
      type: String,
    },
    scale: {
      type: Number,
      default: 24,
    },
  },

  inject: [ 'mdiIcons' ],

  computed: {
    iconToUse() {
      if(!this.name && !this.icon) {
        console.warn('NXT Components MdiIcon: You need to provide either the name of the Mdi icon or the icon itself');
        return;
      }
      if(this.icon) return this.icon;
      const _icon = this.mdiIcons[this.name];
      if(!_icon) console.warn(`NXT Components MdiIcon (${ this.name }): You have specified the name of an unknown icon, please add it to the icon-list used in your app`);
      return _icon;
    },
  },
};
</script>

<style scoped>
svg path {
  fill: currentColor;
}
</style>
