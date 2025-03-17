import { MemberPublicInfo } from "@/model/dtos";

export const SEARCH_DELAY_MS = 100;

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
