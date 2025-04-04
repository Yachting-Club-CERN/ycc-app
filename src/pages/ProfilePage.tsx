import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

import ReadingFriendlyBox from "@/components/layout/ReadingFriendlyBox";
import PageTitle from "@/components/ui/PageTitle";
import useCurrentUser from "@/context/auth/useCurrentUser";

const ProfilePage = () => {
  const currentUser = useCurrentUser();
  const yccOnly = (array: readonly string[]) => {
    return array
      .filter((el) => el.startsWith("ycc"))
      .sort((a, b) => a.localeCompare(b));
  };

  return (
    <ReadingFriendlyBox>
      <PageTitle value="Profile" />
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table className="ycc-profile-table">
          <TableBody>
            <TableRow>
              <TableCell>Username:</TableCell>
              <TableCell>{currentUser.username}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>First Name:</TableCell>
              <TableCell>{currentUser.firstName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Last Name:</TableCell>
              <TableCell>{currentUser.lastName.toUpperCase()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Email:</TableCell>
              <TableCell>{currentUser.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Groups:</TableCell>
              <TableCell>{yccOnly(currentUser.groups).join(", ")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Roles:</TableCell>
              <TableCell>{yccOnly(currentUser.roles).join(", ")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </ReadingFriendlyBox>
  );
};

export default ProfilePage;
