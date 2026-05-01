import dayjs from 'dayjs';

// @IDEA :: We could also have our own date object that has methods to output in desired format 🤔

// end of the date:
// dayjs.tz(to, timezone).endOf('date')
// start of the next day:
// dayjs.tz(to, timezone).add(1, 'day').startOf('date')

// We include the start of the next day

export const periodToIsoStrings = timezone => ({ from, to }) => ({
  from: dayjs.tz(from, timezone).startOf('date').toISOString(),
  to: dayjs.tz(to, timezone).add(1, 'day').startOf('date').toISOString(),
});

export const periodToUnixTimestamps = timezone => ({ from, to }) => ({
  from: dayjs.tz(from, timezone).startOf('date').valueOf(),
  to: dayjs.tz(to, timezone).add(1, 'day').startOf('date').valueOf(),
});
