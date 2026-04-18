import { format, formatDistanceToNow, isToday, isYesterday, isPast, isThisWeek, parseISO, differenceInCalendarDays } from "date-fns";

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  try {
    const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch { return ""; }
}

export function shortDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return format(d, "MMM d");
  } catch { return ""; }
}

export function timelineGroup(dateStr) {
  if (!dateStr) return "Earlier";
  const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isThisWeek(d)) return "This week";
  return "Earlier";
}

export function dueBucket(task) {
  if (!task.due_date) return "upcoming";
  const d = parseISO(task.due_date);
  const diff = differenceInCalendarDays(d, new Date());
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  return "upcoming";
}

export { format, parseISO, isPast };