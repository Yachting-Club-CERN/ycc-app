import ReadingBox from "@/components/layout/ReadingBox";

import MyTasksView from "./MyTasksView";
import ProfileView from "./ProfileView";
import HelpersSpeedDial from "../helpers/components/HelpersSpeedDial";

const HomePage: React.FC = () => {
  return (
    <ReadingBox>
      <HelpersSpeedDial />
      <MyTasksView />
      <ProfileView />
    </ReadingBox>
  );
};

export default HomePage;
