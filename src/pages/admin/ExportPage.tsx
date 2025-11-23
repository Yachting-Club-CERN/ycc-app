import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import { useState } from "react";

import { ALL_YEARS, useYearSelector } from "@/components/input/YearSelector";
import ReadingBoxLarge from "@/components/layout/ReadingBoxLarge";
import RowStack from "@/components/layout/RowStack";
import SpacedBox from "@/components/layout/SpacedBox";
import ErrorAlert from "@/components/ui/ErrorAlert";
import PageTitle from "@/components/ui/PageTitle";
import PromiseStatus from "@/components/ui/PromiseStatus";
import useCurrentUser from "@/context/auth/useCurrentUser";
import { useNavigate } from "@/hooks/useNavigate";
import usePromise from "@/hooks/usePromise";
import client from "@/utils/client";
import { getCurrentYear } from "@/utils/date-utils";

const ExportPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const yearSelector = useYearSelector({ initialYear: getCurrentYear() });
  const [error, setError] = useState<unknown>();
  const [isExporting, setIsExporting] = useState(false);

  if (!currentUser.helpersAppAdmin) {
    void navigate("/");
  }

  const tasks = usePromise(
    () => client.helpers.getTasks(yearSelector.selectedYearForApi),
    [yearSelector.selectedYearForApi],
  );

  const handleExport = (): void => {
    setError(undefined);
    setIsExporting(true);

    try {
      if (!tasks.result) {
        setError(new Error("No tasks loaded to export"));
        setIsExporting(false);
        return;
      }

      const jsonString = JSON.stringify(tasks.result, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `helper-tasks-${yearSelector.selectedYear === ALL_YEARS ? "all" : yearSelector.selectedYear}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ReadingBoxLarge>
      <PageTitle value="Export" />

      <SpacedBox>{yearSelector.component}</SpacedBox>

      <>
        {error && (
          <SpacedBox>
            <ErrorAlert error={error} />
          </SpacedBox>
        )}
      </>

      {tasks.result && (
        <SpacedBox>
          <RowStack wrap={false}>
            <div>
              Found {tasks.result.length} task
              {tasks.result.length !== 1 ? "s" : ""} for{" "}
              {yearSelector.selectedYear}
            </div>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={isExporting || tasks.result.length === 0}
            >
              Export JSON
            </Button>
          </RowStack>
        </SpacedBox>
      )}

      <PromiseStatus outcomes={[tasks]} />
    </ReadingBoxLarge>
  );
};

export default ExportPage;
