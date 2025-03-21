import { z } from "zod";

import dayjs from "@/utils/dayjs";

import {
  LicenceInfoSchema,
  MemberPublicInfoSchema,
  zodTransformDate,
} from "./dtos";

export enum HelperTaskType {
  Shift = "Shift",
  Deadline = "Deadline",
  Unknown = "Unknown",
}

export enum HelperTaskState {
  Pending = "Pending",
  Done = "Done",
  Validated = "Validated",
}

export const HelperTaskCategorySchema = z
  .object({
    id: z.number(),
    title: z.string(),
    shortDescription: z.string(),
    longDescription: z.string().nullable(),
  })
  .readonly();
export type HelperTaskCategory = z.infer<typeof HelperTaskCategorySchema>;

export const HelperTaskCategoriesSchema = z.array(HelperTaskCategorySchema);
export type HelperTaskCategories = z.infer<typeof HelperTaskCategoriesSchema>;

export const HelperTaskHelperSchema = z
  .object({
    member: MemberPublicInfoSchema,
    signedUpAt: z.string().transform(zodTransformDate),
  })
  .readonly();
export type HelperTaskHelper = z.infer<typeof HelperTaskHelperSchema>;

export const HelperTaskHelpersSchema = z.array(HelperTaskHelperSchema);
export type HelperTaskHelpers = z.infer<typeof HelperTaskHelpersSchema>;

export const getHelperTaskType = (task: {
  startsAt: dayjs.Dayjs | null;
  endsAt: dayjs.Dayjs | null;
  deadline: dayjs.Dayjs | null;
}) => {
  if (task.startsAt && task.endsAt && !task.deadline) {
    return HelperTaskType.Shift;
  } else if (!task.startsAt && !task.endsAt && task.deadline) {
    return HelperTaskType.Deadline;
  } else {
    return HelperTaskType.Unknown;
  }
};

export const getHelperTaskState = (task: {
  validatedAt: dayjs.Dayjs | null;
  markedAsDoneAt: dayjs.Dayjs | null;
}) => {
  if (task.validatedAt) {
    return HelperTaskState.Validated;
  } else if (task.markedAsDoneAt) {
    return HelperTaskState.Done;
  } else {
    return HelperTaskState.Pending;
  }
};

export const HelperTaskSchema = z
  .object({
    id: z.number(),
    category: HelperTaskCategorySchema,
    title: z.string(),
    shortDescription: z.string(),
    longDescription: z.string().nullable(),
    contact: MemberPublicInfoSchema,
    startsAt: z.unknown().transform(zodTransformDate).nullable(),
    endsAt: z.unknown().transform(zodTransformDate).nullable(),
    deadline: z.unknown().transform(zodTransformDate).nullable(),
    urgent: z.boolean(),
    captainRequiredLicenceInfo: LicenceInfoSchema.nullable(),
    helperMinCount: z.number(),
    helperMaxCount: z.number(),
    published: z.boolean(),
    captain: HelperTaskHelperSchema.nullable(),
    helpers: HelperTaskHelpersSchema,
    markedAsDoneAt: z.unknown().transform(zodTransformDate).nullable(),
    markedAsDoneBy: MemberPublicInfoSchema.nullable(),
    markedAsDoneComment: z.string().nullable(),
    validatedAt: z.unknown().transform(zodTransformDate).nullable(),
    validatedBy: MemberPublicInfoSchema.nullable(),
    validationComment: z.string().nullable(),
  })
  .transform((values) => ({
    ...values,
    get type() {
      return getHelperTaskType(values);
    },
    get state() {
      return getHelperTaskState(values);
    },
  }))
  // Make it readonly() since mutations would not update calculated properties
  .readonly();
export type HelperTask = z.infer<typeof HelperTaskSchema>;

export const HelperTasksSchema = z.array(HelperTaskSchema);
export type HelperTasks = z.infer<typeof HelperTasksSchema>;

export const HelperTaskMutationRequestDtoSchema = z.object({
  categoryId: z.number(),
  title: z.string(),
  shortDescription: z.string(),
  longDescription: z.string().nullable(),
  contactId: z.number(),
  startsAt: z.unknown().transform(zodTransformDate).nullable(),
  endsAt: z.unknown().transform(zodTransformDate).nullable(),
  deadline: z.unknown().transform(zodTransformDate).nullable(),
  urgent: z.boolean(),
  captainRequiredLicenceInfoId: z.number().nullable(),
  helperMinCount: z.number(),
  helperMaxCount: z.number(),
  published: z.boolean(),
});
export type HelperTaskMutationRequestDto = z.infer<
  typeof HelperTaskMutationRequestDtoSchema
>;

export const HelperTaskMarkAsDoneRequestDtoSchema = z.object({
  comment: z.string().nullable(),
});

export type HelperTaskMarkAsDoneRequestDto = z.infer<
  typeof HelperTaskMarkAsDoneRequestDtoSchema
>;

export const HelperTaskValidationRequestDtoSchema = z.object({
  helpersToValidate: z.array(HelperTaskHelperSchema),
  helpersToRemove: z.array(HelperTaskHelperSchema),
  comment: z.string().nullable(),
});

export type HelperTaskValidationRequestDto = z.infer<
  typeof HelperTaskValidationRequestDtoSchema
>;
