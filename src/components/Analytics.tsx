import {useLocation} from 'react-router-dom';

const Analytics = () => {
  const location = useLocation();
  console.log(location.pathname, location);
  return null;
};

export default Analytics;
