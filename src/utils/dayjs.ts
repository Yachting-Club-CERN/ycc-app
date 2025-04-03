import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { TIME_ZONE_ID } from "./constants";

dayjs.extend(utc);
dayjs.extend(timezone);

// The App is in English and should always reflect YCC time zone
dayjs.locale("en-gb");
dayjs.tz.setDefault(TIME_ZONE_ID);

export default dayjs;
