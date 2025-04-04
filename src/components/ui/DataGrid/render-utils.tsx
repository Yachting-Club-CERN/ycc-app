import { GridRenderCellParams, GridValidRowModel } from "@mui/x-data-grid";

import EmailLink from "../links/EmailLink";
import PhoneLink from "../links/PhoneLink";

export const renderEmail = (
  params: GridRenderCellParams<GridValidRowModel, string | null>,
) => {
  return <EmailLink email={params.value} />;
};

export const renderPhoneNumber = (
  params: GridRenderCellParams<GridValidRowModel, string | null>,
) => {
  return <PhoneLink phone={params.value} />;
};
