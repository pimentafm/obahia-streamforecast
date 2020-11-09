import React, { useEffect } from 'react';

import Map from '../../components/MapRegion';

import ReactGA from 'react-ga';

const Region: React.FC = () => {
  useEffect(() => {
    ReactGA.initialize('UA-182410588-7');
    ReactGA.pageview('/');
  }, []);
  return <Map defaultYear={2018} defaultCategory="regional" />;
};

export default Region;
