import { MemberPublicInfo } from "@/model/dtos";

export const getFullName = (member: MemberPublicInfo) =>
  `${member.firstName} ${member.lastName.toUpperCase()}`;

export const getFullNameAndUsername = (member: MemberPublicInfo) =>
  `${getFullName(member)} (${member.username})`;
