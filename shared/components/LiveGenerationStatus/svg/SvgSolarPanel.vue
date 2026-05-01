<template>
<div class="solar-panel">
  <svg
    class="solar-panel__left"
    :width="panelScale * 32"
    :height="panelScale * 36"
    viewBox="0 0 32 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M31 4H17L2 34H16L31 4Z" fill="white"/>
    <path
      d="M32 2H16.618C16.2393 2 15.893 2.214 15.7236 2.55279L8 18"
      stroke="white"
      stroke-width="4"
    />
    <path d="M14 17L19 7H28L23 17H14Z" fill="#DDDFE3"/>
    <path d="M7 32L12 22H21L16 32H7Z" fill="#DDDFE3"/>
    <path
      d="M9 19L23 19"
      stroke="#525252"
      stroke-width="4"
      vector-effect="non-scaling-stroke"
    />
    <path
      d="M31 4H17.618C17.2393 4 16.893 4.214 16.7236 4.55279L2.72361 32.5528C2.39116 33.2177 2.87465 34 3.61803 34H16"
      stroke="#525252"
      stroke-width="4"
      vector-effect="non-scaling-stroke"
    />
  </svg>

  <div
    class="solar-panel__middle-wrapper"
    :style="{ 'margin-left': panelScale * -20 + 'px' }"
  >
    <svg
      v-for="idx in numPanels - 2"
      :key="idx"
      class="solar-panel__middle"
      :width="panelScale * 38"
      :height="panelScale * 36"
      :style="{ 'margin-left': idx === 1 ? 0 : panelScale * -24 + 'px' }"
      viewBox="0 0 38 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M33 4H19L4 34H18L33 4Z" fill="white"/>
      <path
        d="M20 4L21 2H33L32 4"
        stroke="white"
        stroke-width="4"
      />
      <path d="M16 17L21 7H30L25 17H16Z" fill="#DDDFE3"/>
      <path d="M9 32L14 22H23L18 32H9Z" fill="#DDDFE3"/>
      <path
        d="M33 4H19L4 34H18L33 4Z"
        stroke="#525252"
        stroke-width="4"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M11 19L25 19"
        stroke="#525252"
        stroke-width="4"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  </div>

  <svg
    class="solar-panel__right"
    :width="panelScale * 34"
    :height="panelScale * 36"
    :style="{ 'margin-left': panelScale * -20 + 'px' }"
    viewBox="0 0 34 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M29 4H15L0 34H14L29 4Z" fill="white"/>
    <path
      d="M15 2H27.1459C29.376 2 30.8265 4.34694 29.8292 6.34164L17 32"
      stroke="white"
      stroke-width="4"
    />
    <path d="M12 17L17 7H26L21 17H12Z" fill="#DDDFE3"/>
    <path d="M5 32L10 22H19L14 32H5Z" fill="#DDDFE3"/>
    <path
      d="M15 4H27.382C28.1253 4 28.6088 4.78231 28.2764 5.44721L14.2764 33.4472C14.107 33.786 13.7607 34 13.382 34H0"
      stroke="#525252"
      stroke-width="4"
      vector-effect="non-scaling-stroke"
    />
    <path
      d="M7 19L21 19"
      stroke="#525252"
      stroke-width="4"
      vector-effect="non-scaling-stroke"
    />
  </svg>

</div>
</template>

<script>
export default {
  props: {
    numPanels: {
      type: Number,
      default: 4,
    },
    panelScale: {
      type: Number,
      default: 1,
    },
  },
};
</script>

<style lang="scss">
.solar-panel {
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;

  * {
    flex-shrink: 0;
  }

  &__middle-wrapper {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    z-index: 2;
  }

  &__left,
  &__right {
    position: relative;
    z-index: 1;
  }
}
</style>
