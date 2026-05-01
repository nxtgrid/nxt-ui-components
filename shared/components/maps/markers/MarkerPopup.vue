<template>
<div class="marker-popup">
  <h3 class="marker-popup__title">
    {{ data.title }}
  </h3>
  <div class="marker-popup__content">
    <p v-if="data.subtitle">
      {{ data.subtitle }}
    </p>
    <dl v-if="data.items?.length" class="marker-popup__items-list">
      <div
        v-for="item in data.items"
        :key="item.title"
      >
        <dt>{{ item.title }}:</dt>
        <dd v-html="item.value"></dd>
      </div>
    </dl>
    <div v-if="data.poleWithMeterIssues" class="pole-issues">
      <p v-if="!data.poleWithMeterIssues.otherMeters.length">
        This meter is on pole <strong>{{ data.poleWithMeterIssues.external_reference }}</strong>
      </p>
      <template v-else>
        <p>This meter shares pole <strong>{{ data.poleWithMeterIssues.external_reference }}</strong> with:</p>
        <p>
          <template
            v-for="(meter, index) in data.poleWithMeterIssues.otherMeters"
            :key="meter.external_reference"
          >
            <template v-if="!meter.hasSameIssue">
              {{ meter.external_reference }}
            </template>
            <router-link
              v-else
              :to="meter.link"
              class="pole-issues__same"
            >
              {{ meter.external_reference }}
            </router-link>{{ index === data.poleWithMeterIssues.otherMeters.length - 1 ? '' : ', ' }}
          </template>
        </p>
      </template>
    </div>
  </div>

  <nxt-button
    v-if="data.link"
    :to="data.link.to"
    class="mt-0-half"
    variant="primary"
    size="tiny"
  >
    {{ data.link.text }}
  </nxt-button>
</div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss">
.marker-popup {
  &__title {
    font-size: 0.875rem;
    line-height: 1.5;
  }

  &__content {
    font-size: 0.75rem;
    line-height: 1.5;
  }

  &__items-list {
    margin: 0.25rem 0 0;
    padding-top: 0.25rem;
    border-top: thin solid $nxt-color-blue-light;

    div {
      display: flex;
      column-gap: 8px;
    }

    dt {
      font-weight: 700;
    }

    dd {
      margin-left: 0;
    }
  }
}

.pole-issues {
  margin-top: 0.25rem;
  padding-top: 0.25rem;
  border-top: thin solid $nxt-color-blue-light;
  max-width: 320px;

  &__same {
    font-weight: 700;
    color: $nxt-color-error;
  }
}
</style>
