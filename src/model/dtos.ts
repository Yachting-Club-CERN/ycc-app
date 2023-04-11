export type MemberPublicInfo = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  mobilePhone?: string | null;
  homePhone?: string | null;
  workPhone?: string | null;
};

export type MemberPublicInfos = MemberPublicInfo[];

export type LicenceInfo = {
  id: number;
  licence: string;
};
