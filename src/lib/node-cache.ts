import { TASK_CACHE_TTL } from "@/constants/cache-constants.js";
import NodeCache from "node-cache";

export const CACHE = new NodeCache({ stdTTL: TASK_CACHE_TTL });

export function wildCardDelCacheKey(start: string) {
  const keys = CACHE.keys();

  const matchedKeys = keys.filter((key) => key.startsWith(start));

  CACHE.del(matchedKeys);
}
