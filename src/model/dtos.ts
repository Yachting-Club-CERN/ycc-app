import {RefinementCtx, z} from 'zod';

import dayjs from '@app/utils/dayjs';

export const zodTransformDate = (
  value: unknown,
  ctx: RefinementCtx
): dayjs.Dayjs => {
  if (typeof value === 'string') {
    const date = dayjs(value);
    if (date.isValid()) {
      return date;
    }
  } else if (dayjs.isDayjs(value)) {
    return value;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: 'Invalid date',
  });
  return z.NEVER;
};

//
// Member
//

export const MemberPublicInfoSchema = z
  .object({
    id: z.number(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().nullable(),
    mobilePhone: z.string().nullable(),
    homePhone: z.string().nullable(),
    workPhone: z.string().nullable(),
  })
  .readonly();
export type MemberPublicInfo = z.infer<typeof MemberPublicInfoSchema>;

export const MemberPublicInfosSchema = z.array(MemberPublicInfoSchema);
export type MemberPublicInfos = z.infer<typeof MemberPublicInfosSchema>;

//
// Licence
//

const LicenceInfoBaseSchema = z.object({
  id: z.number(),
  licence: z.string(),
});

export const LicenceInfoSchema = LicenceInfoBaseSchema.readonly();
export type LicenceInfo = z.infer<typeof LicenceInfoSchema>;

export const LicenceInfosSchema = z.array(LicenceInfoSchema);
export type LicenceInfos = z.infer<typeof LicenceInfosSchema>;

export const LicenceDetailedInfoSchema = LicenceInfoBaseSchema.extend({
  description: z.string(),
}).readonly();
export type LicenceDetailedInfo = z.infer<typeof LicenceDetailedInfoSchema>;

export const LicenceDetailedInfosSchema = z.array(LicenceDetailedInfoSchema);
export type LicenceDetailedInfos = z.infer<typeof LicenceDetailedInfosSchema>;
