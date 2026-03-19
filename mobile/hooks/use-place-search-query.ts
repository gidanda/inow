import { useQuery } from "@tanstack/react-query";

import { searchPlaces } from "../services/api";

export function usePlaceSearchQuery(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ["places", query],
    queryFn: () => searchPlaces(query),
    enabled: enabled && query.trim().length > 0
  });
}

