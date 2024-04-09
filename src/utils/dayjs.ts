import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

export const TIMEZONE_ID = 'Europe/Zurich';

dayjs.extend(utc);
dayjs.extend(timezone);

// The App is in English and should always reflect YCC time zone
dayjs.locale('en-gb');
dayjs.tz.setDefault(TIMEZONE_ID);

export default dayjs;
