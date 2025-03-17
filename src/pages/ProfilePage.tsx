import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { useContext } from "react";

import PageTitle from "@/components/PageTitle";
import ReadingFriendlyBox from "@/components/ReadingFriendlyBox";
import AuthenticationContext from "@/context/AuthenticationContext";

const ProfilePage = () => {
  const currentUser = useContext(AuthenticationContext).currentUser;
  const yccOnly = (array: readonly string[]) => {
    return array
      .filter((el) => el.startsWith("ycc"))
      .sort((a, b) => a.localeCompare(b));
  };

  return (
    <ReadingFriendlyBox>
      <PageTitle value="Profile" />
      <TableContainer component={Paper}>
        <Table className="ycc-profile-table">
          <TableBody>
            <TableRow>
              <TableCell>Username:</TableCell>
              <TableCell>{currentUser.username}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>First name:</TableCell>
              <TableCell>{currentUser.firstName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Last name:</TableCell>
              <TableCell>{currentUser.lastName}</TableCell>
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
