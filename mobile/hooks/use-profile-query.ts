import { useQuery } from "@tanstack/react-query";

import { getMe, getMyMaps } from "../services/api";

export function useProfileQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe
  });
}

export function useMyMapsQuery() {
  return useQuery({
    queryKey: ["me", "maps"],
    queryFn: getMyMaps
  });
}

