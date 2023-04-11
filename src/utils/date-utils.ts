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
const dateWithDayFormatOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'full',
};
const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  ...dateFormatOptions,
  ...timeFormatOptions,
};

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString(formatLocale, dateFormatOptions);
};

export const formatDateWithDay = (date: Date | string) => {
  return new Date(date).toLocaleString(formatLocale, dateWithDayFormatOptions);
};

export const formatTime = (date: Date | string) => {
  return new Date(date).toLocaleString(formatLocale, timeFormatOptions);
};

export const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString(formatLocale, dateTimeFormatOptions);
};
