import { MemberPublicInfo } from "@/model/dtos";
import dayjs from "@/utils/dayjs";

import { formatDate, formatDateWithDay } from "./date-utils";

export const searchAnyStringProperty = (search: string, object: object) => {
  const s = search.toLowerCase().trim();
  return Object.values(object).some(
    (value) => typeof value === "string" && value.toLowerCase().includes(s),
  );
};

export const searchMemberUsernameOrName = (
  search: string,
  member: MemberPublicInfo,
) => {
  const s = search.toLowerCase().trim();
  return (
    member.username.toLowerCase().includes(s) ||
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(s) ||
    `${member.lastName} ${member.firstName}`.toLowerCase().includes(s)
  );
};

export const toDateSearchString = (date: dayjs.Dayjs | null) =>
  date === null ? "" : `${formatDate(date)} ${formatDateWithDay(date)}`;
