import dayjs from 'dayjs/esm/index.js';

export const formatDate = (date: Date | string) => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateWithDay = (date: Date | string) => {
  return dayjs(date).format('dddd, D MMMM YYYY ');
};

export const formatTime = (date: Date | string) => {
  return dayjs(date).format('HH:mm');
};

export const formatDateTime = (date: Date | string) => {
  return dayjs(date).format('D/M/YYYY, HH:mm');
};

/**
 * Sanitises a date from an input and prepares it to be sent to the server.
 *
 * @param date Date to be sanitised
 * @returns sanitised date
 */
export const sanitiseInputDate = (
  date: string | Date | dayjs.Dayjs | null | undefined
) => {
  if (date === null || date === undefined) {
    return date;
  }

  return dayjs(date).format('YYYY-MM-DDTHH:mm:ss.SSS');
};
