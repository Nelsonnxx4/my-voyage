import { type Rating } from "@/types/voyage";

export const getRatingComment = (rating: Rating): string => {
  const ratingMap: Record<Rating, string> = {
    1: "Very Bad - Terrible experience",
    2: "Bad - Needs improvement",
    3: "Good - Met expectations",
    4: "Great - Very enjoyable",
    5: "Awesome - Perfect experience",
  };
  return ratingMap[rating] || "";
};

export const getRatingColor = (rating: Rating): string => {
  const colorMap: Record<Rating, string> = {
    1: "text-red-600",
    2: "text-orange-500",
    3: "text-yellow-500",
    4: "text-lime-500",
    5: "text-green-600",
  };
  return colorMap[rating];
};
