import { useQuery } from "@tanstack/react-query";

import { getFollows } from "../services/api";

export function useFriendsQuery() {
  return useQuery({
    queryKey: ["me", "follows"],
    queryFn: getFollows
  });
}

