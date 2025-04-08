import dayjs from "@/utils/dayjs";

import { TIME_ZONE_ID } from "./constants";

type OptionalDate = dayjs.Dayjs | string | null | undefined;

export const formatDate = (date: OptionalDate): string | null | undefined => {
  return date === null || date === undefined
    ? date
    : dayjs(date).tz(TIME_ZONE_ID).format("DD/MM/YYYY");
};

export const formatDateWithDay = (
  date: OptionalDate,
): string | null | undefined => {
  return date === null || date === undefined
    ? date
    : dayjs(date).tz(TIME_ZONE_ID).format("dddd, D MMMM YYYY");
};

export const formatTime = (date: OptionalDate): string | null | undefined => {
  return date === null || date === undefined
    ? date
    : dayjs(date).tz(TIME_ZONE_ID).format("HH:mm");
};

export const formatDateTime = (
  date: OptionalDate,
): string | null | undefined => {
  return date === null || date === undefined
    ? date
    : dayjs(date).tz(TIME_ZONE_ID).format("DD/MM/YYYY HH:mm");
};

export const formatDateTimeWithSeconds = (
  date: OptionalDate,
): string | null | undefined => {
  return date === null || date === undefined
    ? date
    : dayjs(date).tz(TIME_ZONE_ID).format("DD/MM/YYYY HH:mm:ss");
};

export const isSameDay = (date1: dayjs.Dayjs, date2: dayjs.Dayjs): boolean =>
  date1.isSame(date2, "day");

export const getCurrentYear = (): number => dayjs().year();

export const getNow = (): dayjs.Dayjs => dayjs();
