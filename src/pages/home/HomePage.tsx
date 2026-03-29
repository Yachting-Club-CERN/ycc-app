import ReadingBox from "@/components/layout/ReadingBox";
import HelpersSpeedDial from "@/pages/helpers/components/HelpersSpeedDial";

import MyTasksView from "./MyTasksView";
import ProfileView from "./ProfileView";

const HomePage = (): React.ReactNode => {
  return (
    <ReadingBox>
      <HelpersSpeedDial />
      <MyTasksView />
      <ProfileView />
    </ReadingBox>
  );
};

export default HomePage;
