<template>
<div>
  <div class="top-customers-wrapper">
    <figure class="top-customers">
      <figcaption class="top-customers__title">
        <mdi-icon class="top-customers__title__icon" :icon="mdiCurrencyUsd" />
        <span class="top-customers__title__text">Top spenders</span>
      </figcaption>
      <ol class="top-customers__list" v-if="topSpenders.length">
        <li
          v-for="(spender, index) in topSpenders"
          :key="index"
          class="top-customers__list-item"
        >
          <router-link
            :to="`/grid/${ gridMeta.id }/customer/${ spender.id }`"
            class="top-customers__name link-inline"
            :title="spender.full_name"
          >
            {{ spender.full_name }}
          </router-link>
          <span class="top-customers__value">
            ₦ {{ Math.round(spender.amount).toLocaleString() }}
          </span>
        </li>
      </ol>
      <ol class="top-customers__list" v-else>
        <li
          v-for="n in 3"
          :key="n"
          class="top-customers__list-item"
        >
          <span class="top-customers__name">-</span>
          <span class="top-customers__value">
            ₦ 0
          </span>
        </li>
      </ol>
    </figure>
    <figure class="top-customers">
      <figcaption class="top-customers__title">
        <mdi-icon class="top-customers__title__icon" :icon="mdiLightningBoltOutline" />
        <span class="top-customers__title__text">Top consumers</span>
      </figcaption>
      <ol class="top-customers__list" v-if="topConsumers.length">
        <li
          v-for="(consumer, index) in topConsumers"
          :key="index"
          class="top-customers__list-item"
          :title="consumer.customer_full_name"
        >
          <router-link
            :to="`/grid/${ gridMeta.id }/customer/${ consumer.customer_id }`"
            class="top-customers__name link-inline"
            :title="consumer.full_name"
          >
            {{ consumer.customer_full_name }}
          </router-link>
          <span class="top-customers__value">{{ Math.round(consumer.consumption_kwh).toLocaleString() }} kWh</span>
        </li>
      </ol>
      <ol class="top-customers__list" v-else>
        <li
          v-for="n in 3"
          :key="n"
          class="top-customers__list-item"
        >
          <span class="top-customers__name">-</span>
          <span class="top-customers__value">
            0 kWh
          </span>
        </li>
      </ol>
    </figure>
    <!-- <div v-else class="scc scc-overlay overlay-cover"></div> -->

  </div>
  <p class="dashboard-card__title">Principal customers this month</p>
</div>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { baseOpsRestRepo } from '@nxt/libraries/api-connection/repo/baseOpsRestRepo';

import { mdiCurrencyUsd, mdiLightningBoltOutline } from '@mdi/js';

export default {
  props: {
    gridMeta: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const grid_id = props.gridMeta.id;
    const dates = { end: null, start: null };

    const updateDates = () => {
      dates.end = dayjs().tz(props.gridMeta.timezone);
      dates.start = dates.end.startOf('month');
    };

    const topSpenders = ref([]);
    const fetchSpending = () => {
      baseSupabaseRepo.client
        .rpc('find_top_spenders', {
          grid_id,
          start_date: dates.start,
          end_date: dates.end,
          limit_count: 3,
        })
        .then(baseSupabaseRepo.handleResponse)
        .then(spenders => { topSpenders.value = spenders; })
      ;
    };

    const topConsumers = ref([]);
    const fetchConsuming = () => {
      baseOpsRestRepo.fetcher
        .post(`data-analytics/grid/${ grid_id }/top-consumers`, {
          json: {
            start_date: dates.start,
            end_date: dates.end,
            limit_count: 3,
          },
        })
        .json()
        .catch(baseOpsRestRepo.unwrapError)
        .then(consumers => { topConsumers.value = consumers; });
    };

    const refreshData = () => {
      updateDates();
      fetchSpending();
      fetchConsuming();
    };
    refreshData();

    return { topSpenders, topConsumers, refreshData, mdiCurrencyUsd, mdiLightningBoltOutline };
  },
};
</script>

<style lang="scss">
.top-customers-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 16px;
  margin-bottom: 1rem;
}

.top-customers {
  font-weight: 700;
  margin: 0;

  &__title {
    display: flex;
    align-items: center;
    font-size: 18px;
    border-bottom: 2px solid $nxt-color-background-light;
    padding-bottom: 0.25rem;
    margin-bottom: 0.75rem;
    color: $nxt-color-blue;

    &__icon {
      margin-left: -6px;
      color: $nxt-color-warn;
    }

    &__text {
      @include clamp(1);
    }
  }

  &__list {
    padding-left: 0;
    font-weight: 700;
  }

  &__list-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.75rem;

    &:nth-child(1) {
      .top-customers__value {
        color: goldenrod;
      }
    }
    &:nth-child(2) {
      .top-customers__value {
        color: #A9A9A9;
      }
    }
    &:nth-child(3) {
      .top-customers__value {
        color: #cd7f32;
      }
    }
  }

  &__name {
    @include clamp(1);
  }
}
</style>
