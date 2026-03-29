import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import { useState } from "react";

import { useYearSelector } from "@/components/input/YearSelector";
import ReadingBoxLarge from "@/components/layout/ReadingBoxLarge";
import SpacedBox from "@/components/layout/SpacedBox";
import ErrorAlert from "@/components/ui/ErrorAlert";
import PageTitle from "@/components/ui/PageTitle";
import { HelperTask } from "@/model/helpers-dtos";
import client from "@/utils/client";
import dayjs from "@/utils/dayjs";

const ExportPage = (): React.ReactNode => {
  const yearSelector = useYearSelector();
  const [error, setError] = useState<Error | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (): Promise<void> => {
    setError(null);
    setIsExporting(true);

    try {
      const tasks: HelperTask[] = await client.helpers.getTasks(
        yearSelector.selectedYearForApi,
      );

      const jsonString = JSON.stringify(tasks, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const year = yearSelector.selectedYear;
      const currentDateTime = dayjs().format("YYYY-MM-DD-HHmmss");
      link.download = `ycc-app-export-${year}-at-${currentDateTime}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.setTimeout(() => URL.revokeObjectURL(url), 500);
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ReadingBoxLarge>
      <PageTitle value="Export" />

      <SpacedBox>{yearSelector.component}</SpacedBox>

      {error && (
        <SpacedBox>
          <ErrorAlert error={error} />
        </SpacedBox>
      )}

      <SpacedBox>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? "Exporting..." : "Export JSON"}
        </Button>
      </SpacedBox>
    </ReadingBoxLarge>
  );
};

export default ExportPage;
