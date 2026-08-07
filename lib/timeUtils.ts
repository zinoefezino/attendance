const OFFICE_TIMEZONE = "Africa/Lagos";

export function getOfficeTimeParts() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: OFFICE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const map: Record<string, string> = {};
  parts.forEach((p) => (map[p.type] = p.value));

  return {
    hours: parseInt(map.hour, 10),
    minutes: parseInt(map.minute, 10),
    dateStr: `${map.year}-${map.month}-${map.day}`,
  };
}
