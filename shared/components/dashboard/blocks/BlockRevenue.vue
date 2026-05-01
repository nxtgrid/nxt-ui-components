<template>
<div>
  <progress-bar
    :percentage="Math.round(thisMonthPercentageClamped)"
    :sub-percentage="Math.round(lastMonthPercentageClamped)"
    :use-css-transition="false"
  />
  <p class="main-amount">
    ₦ {{ Math.round(revenueThisMonth).toLocaleString() }}
  </p>
  <p class="amount-subtitle">
    revenues of ₦ {{ monthlyRental.toLocaleString() }} monthly costs
  </p>

  <div class="revenue-grid">
    <div>
      <p class="other-amount">
        {{ Math.round(thisMonthPercentage) }}%
      </p>
      <p class="amount-subtitle">
        of monthly costs
      </p>
    </div>
    <div>
      <p class="other-amount">
        {{ Math.round(monthPercentagePassed) }}%
      </p>
      <p class="amount-subtitle">
        of month passed
      </p>
    </div>
    <div>
      <p class="yellow-amount">
        ₦ {{ Math.round(revenueLastMonthAtThisPoint).toLocaleString() }}
      </p>
      <p class="amount-subtitle">
        last month at this point
      </p>
    </div>
    <div>
      <p class="other-amount">
        ₦ {{ Math.round(revenueLastMonth).toLocaleString() }}
      </p>
      <p class="amount-subtitle">
        total last month
      </p>
    </div>
    <div>
      <p class="other-amount">
        ₦ {{ Math.round(arpu).toLocaleString() }}
      </p>
      <p class="amount-subtitle">
        average revenue per user
      </p>
    </div>
  </div>

  <p class="dashboard-card__title">Revenue</p>
</div>
</template>

<script>
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { clamp } from 'ramda';
import { TransitionPresets, useTransition } from '@vueuse/core';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';

import ProgressBar from '../../ProgressBar/ProgressBar.vue';

const clampTo100 = clamp(0, 100);

export default {
  props: {
    gridMeta: {
      type: Object,
      required: true,
    },
    numCustomers: {
      type: Number,
    },
  },

  setup(props) {
    const grid_id = props.gridMeta.id;
    const monthlyRental = props.gridMeta.monthly_rental || 1;

    const _monthPercentagePassed = ref(0);
    const _revenueThisMonth = ref(0);
    const _revenueLastMonth = ref(0);
    const _revenueLastMonthAtThisPoint = ref(0);

    const dates = {
      dateInTimezone: null,
      beginningOfThisMonth: null,
      lastMonthAtThisPoint: null,
      beginningOfLastMonth: null,
      endOfLastMonth: null,
    };

    const updateDates = () => {
      dates.dateInTimezone = dayjs().tz(props.gridMeta.timezone);
      dates.beginningOfThisMonth = dates.dateInTimezone.startOf('month');
      dates.lastMonthAtThisPoint = dates.dateInTimezone.subtract(1, 'month');
      dates.beginningOfLastMonth = dates.lastMonthAtThisPoint.startOf('month');
      dates.endOfLastMonth = dates.beginningOfLastMonth.endOf('month');
    };

    const fetchRevenues = () => {
      updateDates();
      const revenueThisMonthPromise = baseSupabaseRepo.client
        .rpc('find_energy_topup_revenue', {
          grid_id,
          start_date: dates.beginningOfThisMonth.toISOString(),
          end_date: dates.dateInTimezone.toISOString(),
        })
        .then(baseSupabaseRepo.handleResponse)
      ;
      const revenueLastMonthPromise = baseSupabaseRepo.client
        .rpc('find_energy_topup_revenue', {
          grid_id,
          start_date: dates.beginningOfLastMonth.toISOString(),
          end_date: dates.endOfLastMonth.toISOString(),
        })
        .then(baseSupabaseRepo.handleResponse)
      ;
      const revenueLastMonthAtThisPointPromise = baseSupabaseRepo.client
        .rpc('find_energy_topup_revenue', {
          grid_id,
          start_date: dates.beginningOfLastMonth.toISOString(),
          end_date: dates.lastMonthAtThisPoint.toISOString(),
        })
        .then(baseSupabaseRepo.handleResponse)
      ;

      Promise
        .all([ revenueThisMonthPromise, revenueLastMonthPromise, revenueLastMonthAtThisPointPromise ])
        .then(([ __revenueThisMonth, __revenueLastMonth, __revenueLastMonthAtThisPoint ]) => {
          _monthPercentagePassed.value = (dates.dateInTimezone.date() - 1) / dates.dateInTimezone.daysInMonth() * 100;
          _revenueThisMonth.value = __revenueThisMonth ?? 0;
          _revenueLastMonth.value = __revenueLastMonth ?? 0;
          _revenueLastMonthAtThisPoint.value = __revenueLastMonthAtThisPoint ?? 0;
        })
      ;
    };
    fetchRevenues();

    const _thisMonthPercentage = computed(() =>
      _revenueThisMonth.value / monthlyRental * 100);

    const _lastMonthPercentage = computed(() =>
      _revenueLastMonthAtThisPoint.value / monthlyRental * 100);

    const _thisMonthPercentageClamped = computed(() =>
      clampTo100(_thisMonthPercentage.value));

    const _lastMonthPercentageClamped = computed(() =>
      clampTo100(_lastMonthPercentage.value));

    const tSettings = {
      duration: 2000,
      transition: TransitionPresets.easeOutExpo,
    };
    const tSettingsClamped = {
      duration: 2500,
      transition: TransitionPresets.easeOutExpo,
    };

    const _arpu = computed(() => {
      if(!props.numCustomers) return 0;
      return _revenueThisMonth.value / props.numCustomers;
    });

    const monthPercentagePassed = useTransition(_monthPercentagePassed, tSettings);
    const revenueThisMonth = useTransition(_revenueThisMonth, tSettings);
    const revenueLastMonth = useTransition(_revenueLastMonth, tSettings);
    const revenueLastMonthAtThisPoint = useTransition(_revenueLastMonthAtThisPoint, tSettings);
    const thisMonthPercentage = useTransition(_thisMonthPercentage, tSettings);
    const lastMonthPercentage = useTransition(_lastMonthPercentage, tSettings);
    const thisMonthPercentageClamped = useTransition(_thisMonthPercentageClamped, tSettingsClamped);
    const lastMonthPercentageClamped = useTransition(_lastMonthPercentageClamped, tSettingsClamped);
    const arpu = useTransition(_arpu, tSettings);

    return {
      monthlyRental,
      monthPercentagePassed,
      rawRevenueThisMonth: _revenueThisMonth,
      revenueThisMonth,
      revenueLastMonth,
      revenueLastMonthAtThisPoint,
      thisMonthPercentage,
      lastMonthPercentage,
      thisMonthPercentageClamped,
      lastMonthPercentageClamped,
      arpu,
      refreshData: fetchRevenues,
    };
  },

  components: { ProgressBar },
};
</script>

<style lang="scss">
.main-amount {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 0.75rem;
  line-height: 1;
  color: $nxt-color-blue-highlight;
}

.revenue-grid {
  margin-block: 1rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: 1rem;
  column-gap: 16px;
}

.other-amount {
  font-weight: 700;
  color: $nxt-color-blue;
}

.yellow-amount {
  font-weight: 700;
  color: $nxt-color-warn;
}

.amount-subtitle {
  font-size: 0.875rem;
  color: $nxt-color-blue-lighter;
}
</style>
