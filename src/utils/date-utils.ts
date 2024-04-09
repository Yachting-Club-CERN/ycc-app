import dayjs, {TIMEZONE_ID as TIME_ZONE_ID} from '@app/utils/dayjs';

type OptionalDate = dayjs.Dayjs | string | null | undefined;

export const formatDate = (date: OptionalDate) => {
  if (date === null || date === undefined) {
    return date;
  }

  return dayjs(date).tz(TIME_ZONE_ID).format('DD/MM/YYYY');
};

export const formatDateWithDay = (date: OptionalDate) => {
  if (date === null || date === undefined) {
    return date;
  }

  return dayjs(date).tz(TIME_ZONE_ID).format('dddd, D MMMM YYYY ');
};

export const formatTime = (date: OptionalDate) => {
  if (date === null || date === undefined) {
    return date;
  }

  return dayjs(date).tz(TIME_ZONE_ID).format('HH:mm');
};

export const formatDateTime = (date: OptionalDate) => {
  if (date === null || date === undefined) {
    return date;
  }

  return dayjs(date).tz(TIME_ZONE_ID).format('D/M/YYYY, HH:mm');
};

export const getCurrentYear = () => dayjs().year();
