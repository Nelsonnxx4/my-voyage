// date-and-timeUtils.ts
import { formatDistanceToNow, formatDistance, isFuture } from "date-fns";
import type { UserProfile } from "@/types/user";

export const dateAndTime = () => {
  const relativeTripDate = (dates: [Date | string, Date | string]): string => {
    const [start_date, end_date] = dates.map((date) =>
      typeof date === "string" ? new Date(date) : date
    );

    const tripDuration = formatDistance(start_date, end_date);

    const now = new Date();
    const isFutureTrip = isFuture(start_date);

    if (isFutureTrip) {
      return ` ${tripDuration} trip (starts in ${formatDistance(
        start_date,
        now
      )})`;
    } else if (isFuture(end_date)) {
      return ` ${tripDuration} trip (ends in ${formatDistance(end_date, now)})`;
    } else {
      return ` ${tripDuration} trip (ended ${formatDistanceToNow(
        end_date
      )} ago)`;
    }
  };

  const relativeCreatedAt = (date: Date) => {
    return `${formatDistanceToNow(date)} ago`;
  };

  const getJoinedAgo = (
    createdAt: string | null | undefined
  ): string | null => {
    if (!createdAt) return null;

    try {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) return null;

      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.warn("Error parsing date:", error);
      return null;
    }
  };

  // Remove the direct useUserProfile call and accept userData as parameter
  const getJoinedAgoForUser = (userData: UserProfile | null) => {
    return getJoinedAgo(userData?.created_at);
  };

  return {
    getJoinedAgoForUser,
    relativeTripDate,
    relativeCreatedAt,
    getJoinedAgo,
  };
};
