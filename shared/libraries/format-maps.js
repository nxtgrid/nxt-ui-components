import { isNil } from 'ramda';
import { roundToTwoDecimals } from './number-helpers';
import { isObject } from './type-helpers';

export const CURRENCY_MAP = {
  'NGN': '₦',
};

export const ORDER_STATUS_MAP = {
  INITIALISED: 'Initialised',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  IGNORED: 'Ignored',
  CANCELLED: 'Canceled',
  TIMED_OUT: 'Timed out',
  FAILED: 'Failed',
};

export const PAYMENT_CHANNEL_MAP = {
  AYRTON: 'Ayrton/Eos',
  NIFFLER: 'NXT Pay',
  TELEGRAM: 'Telegram',
  USSD: 'USSD',
};

export const PAYMENT_METHOD_MAP = {
  BANK_TRANSFER: 'Bank transfer',
  CREDIT_CARD: 'Credit card',
  USSD: 'USSD',
};

export const METER_PHASE_MAP = {
  SINGLE_PHASE: 'Single-phase',
  THREE_PHASE: 'Three-phase',
};

export const COMMUNICATION_PROTOCOL_MAP = {
  CALIN_LORAWAN: 'LoRaWAN',
  CALIN_V1: 'V1',
  CALIN_V2: 'V2',
};

export const METER_TYPE_MAP = {
  HPS: 'High Priority Service',
  FS: 'Full Service',
};

export const ROLE_MAP = {
  SUPERADMIN: {
    short: 'NXT Grid Staff',
  },
  FINANCE: {
    short: 'NXT Grid Finance',
  },
  DEVELOPER: {
    short: 'Developer',
    extra: 'Info on own grids only',
  },
  TECH: {
    short: 'Technician',
    extra: 'Sphinx only',
  },
  SERVICE: {
    short: 'Service',
  },
};

export const TRAINING_LEVEL_MAP = {
  0: 'Novice (no training received)',
  1: 'Advanced beginner',
  2: 'Competent',
  3: 'Proficient',
  4: 'Expert',
};

export const ISSUES_MAP = {
  NO_COMMUNICATION: {
    short: 'No communication',
    long: 'This meter is not responding',
  },
  NO_CREDIT: {
    short: 'No credit',
    long: 'This meter has no credit available',
  },
  NO_CONSUMPTION: {
    short: 'No consumption',
    long: 'This meter is not consuming energy',
  },
  METER_NOT_ACTIVATED: {
    short: 'Not activated',
  },
  TAMPER: {
    short: 'Tamper',
  },
  POWER_LIMIT_BREACHED: {
    short: 'Power limit breached',
  },
  // @TODO :: deprecate
  POWER_LIMIT_BAD_CONFIGURATION: {
    short: 'Unexpected power limit',
  },
  UNEXPECTED_POWER_LIMIT: {
    short: 'Unexpected power limit',
  },
  OVER_VOLTAGE: {
    short: 'Overvoltage',
  },
  LOW_VOLTAGE: {
    short: 'Low voltage',
  },
  // @TODO :: deprecate
  METER_STATE_BAD_CONFIGURATION: {
    short: 'Unexpected meter status',
  },
  UNEXPECTED_METER_STATUS: {
    short: 'Unexpected meter status',
  },
};

// export const DIRECTIVES_MAP = {
//   READ_SPECIAL_STATUS: {
//     title: 'Read error',
//     resultField: 'directive_special_status',
//     resultFormatFn: result => READ_ERROR_MAP[result] ?? result,
//   },
//   READ_RELAY_STATUS: {
//     title: 'Read relay status',
//     resultField: 'is_on',
//   },
// };

export const METER_INTERACTIONS_MAP = {
  // Reads
  READ_CREDIT: {
    title: 'Read credit',
    getRawResult: ({ result_value }) => {
      return result_value?.kwh_credit_available;
    },
    resultFormatFn: ({ result_value }) => {
      if(!result_value) return;
      const onOffState = result_value.is_on === true ? ' (On)' : result_value.is_on === false ? ' (Off)' : '';
      return `${ result_value.kwh_credit_available } kWh` + onOffState;
    },
  },
  READ_VOLTAGE: {
    title: 'Read voltage',
    getRawResult: ({ result_value }) => {
      return result_value?.voltage;
    },
    resultFormatFn: ({ result_value }) => {
      if(isNil(result_value?.voltage)) return;
      const aggregate = `${ result_value.voltage } V`;

      if(isObject(result_value.phase)) return `
        <strong>${ aggregate }</strong><br>
        phase A: ${ result_value.phase.A ?? '-' } V<br>
        phase B: ${ result_value.phase.B ?? '-' } V<br>
        phase C: ${ result_value.phase.C ?? '-' } V
      `;
      return aggregate;
    },
  },
  READ_POWER: {
    title: 'Read power',
    getRawResult: ({ result_value }) => {
      return result_value?.power;
    },
    resultFormatFn: ({ result_value }) => {
      if(isNil(result_value?.power)) return;
      const aggregate = `${ result_value.power } W`;
      // if(isObject(result_value.phase)) return `
      //   <strong>${ aggregate }</strong><br>
      //   phase A: ${ result_value.phase.A ?? '-' } W<br>
      //   phase B: ${ result_value.phase.B ?? '-' } W<br>
      //   phase C: ${ result_value.phase.C ?? '-' } W
      // `;
      return aggregate;
    },
  },
  READ_CURRENT: {
    title: 'Read current',
    getRawResult: ({ result_value }) => {
      return result_value?.current;
    },
    resultFormatFn: ({ result_value }) => {
      if(!result_value) return;
      const aggregate = `${ result_value.current } A`;

      if(isObject(result_value.phase)) return `
        <strong>${ aggregate }</strong><br>
        phase A: ${ result_value.phase.A ?? '-' } A<br>
        phase B: ${ result_value.phase.B ?? '-' } A<br>
        phase C: ${ result_value.phase.C ?? '-' } A
      `;
      return aggregate;
    },
  },
  READ_POWER_LIMIT: {
    title: 'Read power limit',
    resultFormatFn: ({ result_value }) => {
      if(!result_value) return;
      return `${ result_value.power_limit } W`;
    },
  },
  READ_VERSION: {
    title: 'Read version',
    resultFormatFn: ({ result_value }) => result_value?.version,
  },
  READ_DATE: {
    title: 'Read date',
    resultFormatFn: ({ result_value }) => {
      if(!result_value) return;
      const { year, month, day } = result_value;
      return new Date(year, (month - 1), day).toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    },
  },
  READ_TIME: {
    title: 'Read time',
    resultFormatFn: ({ result_value }) => {
      if(!result_value) return;
      const { hour, minute, second } = result_value;
      return hour + ':' + minute + ':' + second;
      // return new Date(hour, minute, second).toLocaleString(undefined, {
      //   year: 'numeric',
      //   month: 'numeric',
      //   day: 'numeric',
      // });
    },
  },
  READ_REPORT: {
    title: 'Automatic report',
    resultFormatFn: ({ result_value }) => {
      if(!result_value) return;
      const { voltage, current, purchase_remain_source_1, meter_status } = result_value;
      return `
        Voltage: ${ voltage } V<br>
        Credit: ${ roundToTwoDecimals(purchase_remain_source_1) } kWh<br>
        Current: ${ current } A<br>
        Power State: ${ meter_status.relay_open ? 'Off' : 'On' }<br>
        ${ (meter_status.cover_open || meter_status.terminal_cover_open) ? '<strong>⚠️🔓 Meter cover is open!</strong><br>' : '' }
        ${ (meter_status.current_reverse) ? '<strong>⚠️🔄 Current is reversed!</strong><br>' : '' }
        ${ (meter_status.current_unbalance) ? '<strong>⚠️⚖️ Current is unbalanced!</strong><br>' : '' }
        ${ (meter_status.magnetic_interference) ? '<strong>⚠️🧲 Experiencing magnetic interference!</strong><br>' : '' }
      `;
    },
  },

  // Controls
  TURN_ON: {
    title: 'Turn on',
  },
  TURN_OFF: {
    title: 'Turn off',
  },

  // Writes
  SET_DATE: {
    title: 'Set date',
  },
  SET_TIME: {
    title: 'Set time',
  },

  // Tokens
  TOP_UP: {
    title: 'Top up',
    resultFormatFn: ({ transactive_kwh }) => {
      return `${ transactive_kwh } kWh`;
    },
  },
  SET_POWER_LIMIT: {
    title: 'Set power limit',
    resultFormatFn: ({ target_power_limit }) => {
      return `${ target_power_limit } W`;
    },
  },
  CLEAR_CREDIT: {
    title: 'Clear credit',
  },
  CLEAR_TAMPER: {
    title: 'Send clear tamper token',
  },
  DELIVER_PREEXISTING_TOKEN: {
    title: 'Deliver (preexisting) token',
  },

  // Network
  JOIN_NETWORK: {
    title: 'Network join',
  },
};

export const READ_ERROR_MAP = {
  POWER_LIMIT_BREACHED: 'Power limit breached',
  CREDIT_EXHAUSTED: 'Credit exhausted',
  REMOTE_SWITCHED_OFF: 'Remote switched off',
  OVER_VOLTAGE: 'Over voltage',
  METER_NOT_ACTIVATED: 'Meter not activated',
  TAMPER: 'Tamper',
  LOW_VOLTAGE: 'Low voltage',
};

export const DIRECTIVE_ERROR_MAP = {
  GRID_DOWN: 'Grid down',
  DCU_OFFLINE: 'Gateway offline',
  NO_METER: 'No meter',
  NO_DCU: 'No gateway',
  NO_GRID: 'No grid',
};

export const ISSUE_STATUS_MAP = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  OVERRIDDEN: 'Overridden',
};

export const DIRECTIVE_STATUS_MAP = {
  SUCCESSFUL: 'Successful',
  FAILED: 'Failed',
  IGNORED: 'Ignored',
  INITIALISED: 'Initialised',
  TIMED_OUT: 'Timed out',
  PENDING: 'Pending',
  CANCELLED: 'Canceled',
  // all other statuses we will return as Pending
};

export const METER_INTERACTION_STATUS_MAP = {
  QUEUED: 'Queued',
  DEFERRED: 'On Hold',
  SUSPENDED: 'On Hold',
  PROCESSING: 'Processing',
  SUCCESSFUL: 'Successful',
  ABORTED: 'Canceled',
  FAILED: 'Failed',
};
