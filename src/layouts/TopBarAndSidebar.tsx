import React, {useState} from 'react';

import Sidebar from './Sidebar';
import TopBar from './TopBar';

const TopBarAndSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleDrawer = (open?: boolean) => (event: React.SyntheticEvent) => {
    if (
      event &&
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setMobileOpen(open === undefined ? !mobileOpen : open);
  };

  return (
    <>
      <TopBar toggleDrawer={toggleDrawer()} />
      <Sidebar mobileOpen={mobileOpen} toggleDrawer={toggleDrawer} />
    </>
  );
};

export default TopBarAndSidebar;
