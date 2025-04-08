import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

import toJson from "@/utils/toJson";

type Props = {
  data: string | null | undefined;
};

export const AuditLogEntryDataView: React.FC<Props> = ({ data }) => {
  if (data === undefined) {
    return null;
  }
  if (data === null) {
    return <Typography fontStyle="italic">No data</Typography>;
  }

  let dataEntries;

  try {
    const dataJson = JSON.parse(data) as unknown;
    if (typeof dataJson === "object" && !Array.isArray(dataJson)) {
      dataEntries = Object.entries(dataJson as Record<string, unknown>);
    } else {
      data = toJson(dataJson);
    }
  } catch {
    // Ignore JSON parsing error, data remains as is
  }

  if (dataEntries) {
    return (
      <>
        {dataEntries.map(([key, value]) => (
          <Accordion key={key} defaultExpanded={key !== "old" && key !== "new"}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography
                variant="body2"
                fontFamily="Roboto Mono, monospace"
                fontWeight="bold"
              >
                {key}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body2"
                fontFamily="Roboto Mono, monospace"
                whiteSpace="pre-wrap"
              >
                {toJson(value)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box sx={{ height: 8 }} />
      </>
    );
  }

  return (
    <Typography fontFamily="Roboto Mono, monospace" whiteSpace="pre-wrap">
      {data}
    </Typography>
  );
};

export default AuditLogEntryDataView;
