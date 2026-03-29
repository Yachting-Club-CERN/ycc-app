import { GridRenderCellParams, GridValidRowModel } from "@mui/x-data-grid";

import EmailLink from "@/components/ui/links/EmailLink";
import PhoneLink from "@/components/ui/links/PhoneLink";

export const renderEmail = (
  params: GridRenderCellParams<GridValidRowModel, string | null>,
): React.ReactNode => {
  return <EmailLink email={params.value} />;
};

export const renderPhoneNumber = (
  params: GridRenderCellParams<GridValidRowModel, string | null>,
): React.ReactNode => {
  return <PhoneLink phone={params.value} />;
};
