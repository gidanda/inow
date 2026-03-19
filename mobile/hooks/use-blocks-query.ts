import { useQuery } from "@tanstack/react-query";

import { getBlocks } from "../services/api";

export function useBlocksQuery() {
  return useQuery({
    queryKey: ["me", "blocks"],
    queryFn: getBlocks
  });
}

