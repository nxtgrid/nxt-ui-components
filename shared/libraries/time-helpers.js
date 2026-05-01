import dayjs from 'dayjs';

export const forceLeadingZero = number => (number < 10 ? '0' : '') + number;

export const utcTimeToLocalTime = ({ hour, minute }, timezone) => {
  const localTime = dayjs.utc().hour(hour).minute(minute).tz(timezone);
  return { localHour: localTime.hour(), localMinute: localTime.minute() };
};

export const localTimeToUtcTime = ({ hour, minute }, timezone) => {
  const utcTime = dayjs().tz(timezone).hour(hour).minute(minute).utc();
  return { utcHour: utcTime.hour(), utcMinute: utcTime.minute() };
};
