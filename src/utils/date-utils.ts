import dayjs from 'dayjs/esm/index.js';

type OptionalDate = dayjs.Dayjs | string | null | undefined;

export const formatDate = (date: OptionalDate) => {
  if (date === null || date === undefined) {
    return date;
  }

  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateWithDay = (date: OptionalDate) => {
  if (date === null || date === undefined) {
    return date;
  }

  return dayjs(date).format('dddd, D MMMM YYYY ');
};

export const formatTime = (date: OptionalDate) => {
  if (date === null || date === undefined) {
    return date;
  }

  return dayjs(date).format('HH:mm');
};

export const formatDateTime = (date: OptionalDate) => {
  if (date === null || date === undefined) {
    return date;
  }

  return dayjs(date).format('D/M/YYYY, HH:mm');
};

export const getCurrentYear = () => dayjs().year();
