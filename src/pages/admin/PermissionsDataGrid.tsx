import FormControlLabel from "@mui/material/FormControlLabel";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import React, { useState } from "react";

import useConfirmationDialog from "@/components/dialogs/ConfirmationDialog/useConfirmationDialog";
import useMemberInfoDialog from "@/components/dialogs/MemberInfoDialog/useMemberInfoDialog";
import SpacedBox from "@/components/layout/SpacedBox";
import ErrorAlert from "@/components/ui/ErrorAlert";
import useMemberAutocomplete from "@/components/ui/MemberAutocomplete/useMemberAutocomplete";
import useCurrentUser from "@/context/auth/useCurrentUser";
import useResettableRef from "@/hooks/useResettableRef";
import {
  HelpersAppPermission,
  HelpersAppPermissionType,
} from "@/model/helpers-dtos";
import client from "@/utils/client";
import { DATA_GRID_PAGE_SIZE_OPTIONS } from "@/utils/constants";

const columns: GridColDef[] = [
  {
    field: "member.id",
    headerName: "ID",
    width: 70,
    valueGetter: (_, permission: HelpersAppPermission) => permission.member.id,
  },
  {
    field: "member.lastName",
    headerName: "Last Name",
    flex: 1,
    minWidth: 150,
    valueGetter: (_, permission: HelpersAppPermission) =>
      permission.member.lastName.toUpperCase(),
  },
  {
    field: "member.firstName",
    headerName: "First Name",
    flex: 1,
    minWidth: 100,
    valueGetter: (_, permission: HelpersAppPermission) =>
      permission.member.firstName,
  },
  {
    field: "member.username",
    headerName: "Username",
    flex: 1,
    minWidth: 100,
    valueGetter: (_, permission: HelpersAppPermission) =>
      permission.member.username,
  },
  {
    field: "permission",
    headerName: "Permission",
    width: 100,
  },
  {
    field: "note",
    headerName: "Note",
    flex: 2,
    editable: true,
  },
];

type Props = {
  permissions: Readonly<HelpersAppPermission[]>;
  onPermissionsChange: (permissions: HelpersAppPermission[]) => void;
};

const PermissionsDataGrid: React.FC<Props> = ({
  permissions,
  onPermissionsChange,
}) => {
  const currentUser = useCurrentUser();
  const memberInfoDialog = useMemberInfoDialog();
  const memberAutocomplete = useMemberAutocomplete({ mt: 1, mb: 2 });
  const confirmationDialog = useConfirmationDialog();

  const grantDataRef = useResettableRef<{
    permission: HelpersAppPermissionType;
    note: string;
  }>(() => ({
    permission: "EDITOR",
    note: "",
  }));
  const [contextMenu, setContextMenu] = useState<{
    row?: HelpersAppPermission;
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [error, setError] = useState<unknown>();

  const getRowId = (permission: HelpersAppPermission): number =>
    permission.member.id;

  const handleGridCellClick = (
    params: GridCellParams<HelpersAppPermission>,
  ): void => {
    if (params.field === "note") {
      // Editable with double-click
      return;
    }

    return memberInfoDialog.open({
      member: params.row.member,
      extra: {
        Permission: params.row.permission,
        Note: params.row.note ?? "-",
      },
    });
  };

  const handleContextMenuOpen = (event: React.MouseEvent): void => {
    event.preventDefault();

    const id = Number(event.currentTarget.getAttribute("data-id"));
    const row = permissions.find((row) => row.member.id === id);

    setContextMenu({
      row,
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  };

  const handleContextMenuClose = (event?: React.MouseEvent): void => {
    event?.preventDefault();
    setContextMenu(null);
  };

  const handleGrant = (): void => {
    setError(undefined);
    grantDataRef.reset();

    confirmationDialog.open({
      title: "Grant Permission",
      content: (
        <>
          {memberAutocomplete.component}

          <TextField
            variant="outlined"
            label="Note"
            fullWidth
            sx={{ mb: 2 }}
            onChange={(event) => {
              grantDataRef.current.note = event.target.value;
            }}
          />
          <FormControlLabel
            sx={{ mb: 2 }}
            control={
              <Switch
                defaultChecked={grantDataRef.current.permission === "ADMIN"}
                onChange={(_, checked) => {
                  grantDataRef.current.permission = checked
                    ? "ADMIN"
                    : "EDITOR";
                }}
              />
            }
            label="Also grant administrator permissions"
          />
        </>
      ),
      confirmButtonText: "Grant Permission",
      onConfirm: async () => {
        try {
          const newPermission = await client.helpers.grantPermission({
            memberId: memberAutocomplete.requireSelectedMember.id,
            permission: grantDataRef.current.permission,
            note: grantDataRef.current.note,
          });

          onPermissionsChange([newPermission, ...permissions]);
        } catch (error) {
          setError(error);
        }
        console.log(grantDataRef.current);
      },
    });
  };

  const handleRevoke = (permission: HelpersAppPermission): void => {
    setError(undefined);

    confirmationDialog.open({
      title: `Revoke permission from ${permission.member.username}?`,
      content: null,
      confirmButtonColor: "error",
      confirmButtonText: "Revoke permission",
      cancelButtonColor: "primary",
      delayConfirm: true,
      onConfirm: async () => {
        try {
          await client.helpers.revokePermission(permission.member.id);

          onPermissionsChange(
            permissions.filter((row) => row.member.id !== permission.member.id),
          );
        } catch (error) {
          setError(error);
        }
      },
    });
  };

  const processRowUpdate = async (
    update: HelpersAppPermission,
    original: HelpersAppPermission,
  ): Promise<HelpersAppPermission> => {
    setError(undefined);
    if (update.member.id !== original.member.id) {
      setError(new Error("Member ID mismatch"));
      return original;
    }

    if (update.note === original.note) {
      return original;
    }

    const updated = await client.helpers.updatePermission(update.member.id, {
      note: update.note,
    });

    onPermissionsChange(
      permissions.map((row) =>
        row.member.id === updated.member.id ? updated : row,
      ),
    );

    return updated;
  };

  return (
    <>
      {error && (
        <SpacedBox>
          <ErrorAlert error={error} />
        </SpacedBox>
      )}

      <DataGrid
        columns={columns}
        rows={permissions}
        getRowId={getRowId}
        onCellClick={handleGridCellClick}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(error): void => setError(error)}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        density="compact"
        pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          row: {
            onContextMenu: handleContextMenuOpen,
            style: { cursor: "context-menu" },
          },
          toolbar: {
            showQuickFilter: true,
          },
        }}
        sx={{
          // Landscape mode on smartphones. Displays 2 rows, while double scrolling is not annoying.
          minHeight: "215px",
          height: "calc(100vh - 205px)",
        }}
        className="ycc-permissions-data-grid"
      />

      <Menu
        open={contextMenu !== null}
        onClose={() => handleContextMenuClose()}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        slotProps={{
          root: {
            onContextMenu: handleContextMenuClose,
          },
        }}
      >
        <MenuItem
          dense
          onClick={() => {
            handleGrant();
            handleContextMenuClose();
          }}
        >
          Grant permissions...
        </MenuItem>
        {contextMenu?.row &&
          contextMenu.row.member.id !== currentUser.memberId && (
            <MenuItem
              dense
              onClick={() => {
                if (!contextMenu?.row) {
                  return;
                }

                handleRevoke(contextMenu.row);
                handleContextMenuClose();
              }}
            >
              Revoke permissions from {contextMenu?.row?.member.username}
            </MenuItem>
          )}
      </Menu>

      {confirmationDialog.component}
      {memberInfoDialog.component}
    </>
  );
};

export default PermissionsDataGrid;
