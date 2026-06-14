/* constants.ts */

export const HEADING_REGEX = /^[#\s-]*/;
export const HEADING_FORMAT = '#';

export const DATE_REGEX = /(?<target>{{date:?(?<date>[^}]*)}})/g;

/* moment.js */
// export const DEFAULT_DATE_FORMAT = 'YYYYMMDDHHmm';

/* date-fns */
export const DEFAULT_DATE_FORMAT = 'yyyyMMddHHmm';

export const FILE_NAME_REGEX = /[#*"\/\\<>:|\[\]\?]/gim;

/* EOF */