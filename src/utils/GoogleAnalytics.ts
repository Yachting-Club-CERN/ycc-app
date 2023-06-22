import config from 'config';
import ReactGA from 'react-ga4';

export default class GoogleAnalytics {
  static init() {
    if (config.googleAnalyticsId) {
      console.debug('[ga] Initializing Google Analytics');
      ReactGA.initialize(config.googleAnalyticsId);
    } else {
      console.debug('Google Analytics ID not set');
    }
  }

  static logPageView() {
    if (config.googleAnalyticsId) {
      const page = window.location.pathname;
      console.debug('[ga] Logging page view for ' + page);
      ReactGA.send({hitType: 'pageview', page: page});
    }
  }
}
