import { useQuery } from "@tanstack/react-query";

import { searchMaps } from "../services/api";

export function useSearchQuery(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMaps(query)
  });
}

