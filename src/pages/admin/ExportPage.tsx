import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useState } from "react";

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
import { YCC_FIRST_HELPER_APP_YEAR } from "@/utils/constants";
import { getCurrentYear } from "@/utils/date-utils";

const ExportPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const currentYear = getCurrentYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [error, setError] = useState<unknown>();
  const [isExporting, setIsExporting] = useState(false);

  if (!currentUser.helpersAppAdmin) {
    void navigate("/");
  }

  const tasks = usePromise(
    () => client.helpers.getTasks(selectedYear),
    [selectedYear],
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
      link.download = `helper-tasks-${selectedYear}.json`;
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

  const years = Array.from(
    { length: currentYear - YCC_FIRST_HELPER_APP_YEAR + 2 },
    (_, i) => YCC_FIRST_HELPER_APP_YEAR + i,
  );

  return (
    <ReadingBoxLarge>
      <PageTitle value="Export" />

      <SpacedBox>
        <TextField
          select
          label="Select Year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          sx={{ minWidth: 200 }}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>
      </SpacedBox>

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
              {tasks.result.length !== 1 ? "s" : ""} for {selectedYear}
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
