import { useQuery } from "@tanstack/react-query";

import { getMapSpots } from "../services/api";

export function useMapSpotsQuery() {
  return useQuery({
    queryKey: ["map", "spots"],
    queryFn: getMapSpots
  });
}

