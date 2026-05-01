import dayjs from 'dayjs';

export const timeAgo = dateString =>
  !dateString ? 'never' : dayjs().to(dayjs(dateString));

export const prettyLocalizedDateTime = timezone => (dateTime, { withTime = true, withSeconds = false } = {}) => {
  // This works nicer than Dayjs because it formats
  // the new Date (based on UTC date) in the preference
  // of the user that is looking at it rather than the
  // preference in the timezone that is specified
  return new Date(dateTime).toLocaleString(undefined, {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: withTime ? '2-digit' : undefined,
    minute: withTime ? '2-digit' : undefined,
    second: (withTime && withSeconds) ? '2-digit' : undefined,
  });
};
