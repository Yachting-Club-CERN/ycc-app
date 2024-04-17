import dayjs, {TIMEZONE_ID as TIME_ZONE_ID} from '@app/utils/dayjs';

type OptionalDate = dayjs.Dayjs | string | null | undefined;

export const formatDate = (date: OptionalDate) => {
  return date === null || date === undefined
    ? date
    : dayjs(date).tz(TIME_ZONE_ID).format('DD/MM/YYYY');
};

export const formatDateWithDay = (date: OptionalDate) => {
  return date === null || date === undefined
    ? date
    : dayjs(date).tz(TIME_ZONE_ID).format('dddd, D MMMM YYYY');
};

export const formatTime = (date: OptionalDate) => {
  return date === null || date === undefined
    ? date
    : dayjs(date).tz(TIME_ZONE_ID).format('HH:mm');
};

export const formatDateTime = (date: OptionalDate) => {
  return date === null || date === undefined
    ? date
    : dayjs(date).tz(TIME_ZONE_ID).format('D/M/YYYY, HH:mm');
};

export const isSameDay = (date1: dayjs.Dayjs, date2: dayjs.Dayjs) =>
  date1.isSame(date2, 'day');

export const getCurrentYear = () => dayjs().year();
