import { MemberPublicInfo } from "@/model/dtos";

export const getFullName = (member: MemberPublicInfo): string =>
  `${member.firstName} ${member.lastName.toUpperCase()}`;

export const getFullNameAndUsername = (member: MemberPublicInfo): string =>
  `${getFullName(member)} (${member.username})`;
