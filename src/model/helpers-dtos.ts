import { z } from "zod";

import dayjs from "@/utils/dayjs";
import { toDateSearchString } from "@/utils/search-utils";

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

export const HelpersAppPermissionTypeSchema = z.enum(["ADMIN", "EDITOR"]);
export type HelpersAppPermissionType = z.infer<
  typeof HelpersAppPermissionTypeSchema
>;

export const HelpersAppPermissionSchema = z.object({
  member: MemberPublicInfoSchema,
  permission: HelpersAppPermissionTypeSchema,
  note: z.string().nullable(),
});
export type HelpersAppPermission = z.infer<typeof HelpersAppPermissionSchema>;

export const HelpersAppPermissionsSchema = z.array(HelpersAppPermissionSchema);
export type HelpersAppPermissions = z.infer<typeof HelpersAppPermissionsSchema>;

export const HelpersAppPermissionGrantRequestSchema = z.object({
  memberId: z.number(),
  permission: HelpersAppPermissionTypeSchema,
  note: z.string().nullable(),
});
export type HelpersAppPermissionGrantRequest = z.infer<
  typeof HelpersAppPermissionGrantRequestSchema
>;

export const HelpersAppPermissionUpdateRequestSchema = z.object({
  note: z.string().nullable(),
});
export type HelpersAppPermissionUpdateRequest = z.infer<
  typeof HelpersAppPermissionUpdateRequestSchema
>;

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
}): HelperTaskType => {
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
}): HelperTaskState => {
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
  .transform((values) => {
    // Search string for object fields
    // Enums are represented as strings and can be searched using searchAnyStringProperty()
    let searchString: string | undefined;

    return {
      ...values,
      get type(): HelperTaskType {
        return getHelperTaskType(values);
      },
      get state(): HelperTaskState {
        return getHelperTaskState(values);
      },
      get searchString(): string {
        if (searchString !== undefined) {
          return searchString;
        }

        // Convert dates to search strings (only the date is searchable, not the time)
        searchString = [values.startsAt, values.endsAt, values.deadline]
          .map((date) => toDateSearchString(date))
          .filter((dateStr) => dateStr.length > 0)
          .join(" ");

        return searchString;
      },
    };
  })
  // Make it readonly() since mutations would not update calculated properties
  .readonly();
export type HelperTask = z.infer<typeof HelperTaskSchema>;

export const HelperTasksSchema = z.array(HelperTaskSchema);
export type HelperTasks = z.infer<typeof HelperTasksSchema>;

export const HelperTaskMutationRequestBaseSchema = z.object({
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

export type HelperTaskMutationRequestBase = z.infer<
  typeof HelperTaskMutationRequestBaseSchema
>;

export const HelperTaskCreationRequestSchema =
  HelperTaskMutationRequestBaseSchema;

export type HelperTaskCreationRequest = z.infer<
  typeof HelperTaskCreationRequestSchema
>;

export const HelperTaskUpdateRequestSchema =
  HelperTaskMutationRequestBaseSchema.extend({
    notifySignedUpMembers: z.boolean(),
  });

export type HelperTaskUpdateRequest = z.infer<
  typeof HelperTaskUpdateRequestSchema
>;

export const HelperTaskMarkAsDoneRequestSchema = z.object({
  comment: z.string().nullable(),
});

export type HelperTaskMarkAsDoneRequest = z.infer<
  typeof HelperTaskMarkAsDoneRequestSchema
>;

export const HelperTaskValidationRequestDtoSchema = z.object({
  comment: z.string().nullable(),
});

export type HelperTaskValidationRequest = z.infer<
  typeof HelperTaskValidationRequestDtoSchema
>;
