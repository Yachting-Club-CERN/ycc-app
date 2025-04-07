import ReadingBox from "@/components/layout/ReadingBox";

import MyTasksView from "./MyTasksView";
import ProfileView from "./ProfileView";

const HomePage: React.FC = () => {
  return (
    <ReadingBox>
      <MyTasksView />
      <ProfileView />
    </ReadingBox>
  );
};

export default HomePage;
