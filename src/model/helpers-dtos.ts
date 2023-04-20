import {LicenceInfo, MemberPublicInfo} from './dtos';

export type HelperTaskCategory = {
  id: number;
  title: string;
  shortDescription: string;
  longDescription?: string | null;
};

export type HelperTaskCategories = HelperTaskCategory[];

export type HelperTask = {
  id: number;
  category: HelperTaskCategory;
  title: string;
  shortDescription: string;
  longDescription?: string | null;
  contact: MemberPublicInfo;
  // TODO #19 These could be already Date objects at this point
  start?: string | null;
  end?: string | null;
  deadline?: string | null;
  urgent: boolean;
  captainRequiredLicenceInfo?: LicenceInfo | null;
  helpersMinCount: number;
  helpersMaxCount: number;
  published: boolean;

  captain?: HelperTaskHelper | null;
  helpers: HelperTaskHelpers;
};

export type HelperTasks = HelperTask[];

export type HelperTaskHelper = {
  member: MemberPublicInfo;
  // TODO #19 This could be already Date object at this point
  subscribedAt: string;
};

export type HelperTaskHelpers = HelperTaskHelper[];

// TODO Add client side validation for better UX
export type HelperTaskMutationRequestDto = {
  categoryId: number;
  title: string;
  shortDescription: string;
  longDescription?: string | null;
  contactId: number;
  // TODO #19 These could be Date (kept to be consistent with HelperTask)
  start?: string | null;
  end?: string | null;
  deadline?: string | null;
  urgent: boolean;
  captainRequiredLicenceInfoId?: number | null;
  helpersMinCount: number;
  helpersMaxCount: number;
  published: boolean;
};
