// Avoid funny results with an English page running on a French phone
const formatLocale: Intl.LocalesArgument = 'en-GB';
const timeFormatOptions: Intl.DateTimeFormatOptions = {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
};
const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  ...dateFormatOptions,
  ...timeFormatOptions,
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString(formatLocale, dateFormatOptions);
};

const formatTime = (date: Date | string) => {
  return new Date(date).toLocaleString(formatLocale, timeFormatOptions);
};

const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString(formatLocale, dateTimeFormatOptions);
};

export {formatDate, formatTime, formatDateTime};
