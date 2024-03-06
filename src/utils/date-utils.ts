import dayjs from 'dayjs/esm/index.js';

export const formatDate = (date: dayjs.Dayjs | string) => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateWithDay = (date: dayjs.Dayjs | string) => {
  return dayjs(date).format('dddd, D MMMM YYYY ');
};

export const formatTime = (date: dayjs.Dayjs | string) => {
  return dayjs(date).format('HH:mm');
};

export const formatDateTime = (
  date: dayjs.Dayjs | string | null | undefined
) => {
  if (date === null || date === undefined) {
    return date;
  }

  return dayjs(date).format('D/M/YYYY, HH:mm');
};

export const getCurrentYear = () => dayjs().year();
