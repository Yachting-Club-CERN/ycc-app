export const TIME_ZONE_ID = "Europe/Zurich";

export const YCC_FIRST_HELPER_APP_YEAR = 2023;
export const YCC_COMMITTEE_EMAIL_ADDRESS = "club-yachting-committee@cern.ch";

export const YCC_URLS = {
  BOAT_BOOKING: "https://yachting.web.cern.ch/yachting/reserve.html",
  LOGS_RESQ: "https://yccres.app.cern.ch/app/res/logs/15",
  LOGS_MOTHER_DUCK_II: "https://yccres.app.cern.ch/app/res/logs/36",
  WEBSITE: "https://yachting.web.cern.ch",
} as const;

// Only allow attachments for maintenance tasks
export const ATTACHMENTS_CATEGORY_MATCH = "maintenance";

// Aligned with BE entities/DB tables
export const HELPER_TASK_TITLE_MAX_LENGTH = 40;
export const HELPER_TASK_SHORT_DESCRIPTION_MAX_LENGTH = 200;
export const ATTACHMENT_DESCRIPTION_MAX_LENGTH = 150;

// Image processing
export const UPLOAD_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif";
export const UPLOAD_MAX_DIMENSION = 2000;
export const UPLOAD_PHOTO_JPEG_QUALITY = 0.85;

// UI specific
export const CONFIRM_BUTTON_DELAY_MS = 3000;
export const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const SEARCH_DELAY_MS = 100;
export const SX_FAB_POSITION = {
  position: "fixed",
  bottom: 16,
  right: 16,
} as const;
