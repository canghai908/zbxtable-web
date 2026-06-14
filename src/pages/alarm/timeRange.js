import moment from "moment";

export function getDefaultAlarmTimeRange(days = 7) {
  const end = moment();
  const start = moment().subtract(days, "days");
  return [start, end];
}

export function buildAlarmTimeRanges(t) {
  return {
    [t("time_range_last_1d")]: [moment().subtract(1, "days"), moment()],
    [t("time_range_last_3d")]: [moment().subtract(3, "days"), moment()],
    [t("time_range_last_7d")]: [moment().subtract(7, "days"), moment()],
    [t("time_range_last_30d")]: [moment().subtract(30, "days"), moment()],
  };
}
