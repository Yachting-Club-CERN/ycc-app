import { GridRenderCellParams, GridValidRowModel } from "@mui/x-data-grid";
import { JSX } from "react";

import EmailLink from "../links/EmailLink";
import PhoneLink from "../links/PhoneLink";

export const renderEmail = (
  params: GridRenderCellParams<GridValidRowModel, string | null>,
): JSX.Element => {
  return <EmailLink email={params.value} />;
};

export const renderPhoneNumber = (
  params: GridRenderCellParams<GridValidRowModel, string | null>,
): JSX.Element => {
  return <PhoneLink phone={params.value} />;
};
