import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import RowStack from "@/components/layout/RowStack";
import SpacedBox from "@/components/layout/SpacedBox";
import { formatDateWithDay } from "@/utils/date-utils";
import dayjs from "@/utils/dayjs";

type Props = {
  dates: dayjs.Dayjs[];
  excludedDates: Set<string>;
  onToggleDate: (date: dayjs.Dayjs) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  disabled: boolean;
};

const DateChecklist = ({
  dates,
  excludedDates,
  onToggleDate,
  onSelectAll,
  onDeselectAll,
  disabled,
}: Props): React.ReactNode => {
  const includedCount = dates.filter(
    (d) => !excludedDates.has(d.toISOString()),
  ).length;

  return (
    <SpacedBox>
      <RowStack wrap={true} compact={true}>
        <Typography variant="subtitle2">
          {includedCount} of {dates.length} dates selected
        </Typography>
        <Button size="small" onClick={onSelectAll} disabled={disabled}>
          Select all
        </Button>
        <Button size="small" onClick={onDeselectAll} disabled={disabled}>
          Deselect all
        </Button>
      </RowStack>

      <List
        dense
        sx={{
          maxHeight: 300,
          overflow: "auto",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          mt: 1,
        }}
      >
        {dates.map((date) => {
          const key = date.toISOString();
          const isIncluded = !excludedDates.has(key);
          return (
            <ListItem key={key} disablePadding>
              <ListItemButton
                onClick={() => {
                  onToggleDate(date);
                }}
                disabled={disabled}
                dense
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={isIncluded}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={formatDateWithDay(date)} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </SpacedBox>
  );
};

export default DateChecklist;
