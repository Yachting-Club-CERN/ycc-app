import {z} from 'zod';

import {
  LicenceInfoSchema,
  MemberPublicInfoSchema,
  zodTransformDate,
} from './dtos';

export const HelperTaskCategorySchema = z.object({
  id: z.number(),
  title: z.string(),
  shortDescription: z.string(),
  longDescription: z.string().nullable(),
});
export type HelperTaskCategory = z.infer<typeof HelperTaskCategorySchema>;

export const HelperTaskCategoriesSchema = z.array(HelperTaskCategorySchema);
export type HelperTaskCategories = z.infer<typeof HelperTaskCategoriesSchema>;

export const HelperTaskHelperSchema = z.object({
  member: MemberPublicInfoSchema,
  signedUpAt: z.string().transform(zodTransformDate),
});
export type HelperTaskHelper = z.infer<typeof HelperTaskHelperSchema>;

export const HelperTaskHelpersSchema = z.array(HelperTaskHelperSchema);
export type HelperTaskHelpers = z.infer<typeof HelperTaskHelpersSchema>;

export const HelperTaskSchema = z.object({
  id: z.number(),
  category: HelperTaskCategorySchema,
  title: z.string(),
  shortDescription: z.string(),
  longDescription: z.string().nullable(),
  contact: MemberPublicInfoSchema,
  startsAt: z.string().transform(zodTransformDate).nullable(),
  endsAt: z.string().transform(zodTransformDate).nullable(),
  deadline: z.string().transform(zodTransformDate).nullable(),
  urgent: z.boolean(),
  captainRequiredLicenceInfo: LicenceInfoSchema.nullable(),
  helperMinCount: z.number(),
  helperMaxCount: z.number(),
  published: z.boolean(),
  captain: HelperTaskHelperSchema.nullable(),
  helpers: HelperTaskHelpersSchema,
});
export type HelperTask = z.infer<typeof HelperTaskSchema>;

export const HelperTasksSchema = z.array(HelperTaskSchema);
export type HelperTasks = z.infer<typeof HelperTasksSchema>;

// TODO Add client side validation for better UX
export const HelperTaskMutationRequestDtoSchema = z.object({
  categoryId: z.number(),
  title: z.string(),
  shortDescription: z.string(),
  longDescription: z.string().nullable(),
  contactId: z.number(),
  startsAt: z.string().transform(zodTransformDate).nullable(),
  endsAt: z.string().transform(zodTransformDate).nullable(),
  deadline: z.string().transform(zodTransformDate).nullable(),
  urgent: z.boolean(),
  captainRequiredLicenceInfoId: z.number().nullable(),
  helperMinCount: z.number(),
  helperMaxCount: z.number(),
  published: z.boolean(),
});
export type HelperTaskMutationRequestDto = z.infer<
  typeof HelperTaskMutationRequestDtoSchema
>;
