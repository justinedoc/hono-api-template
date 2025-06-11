import logger from "@/lib/logger.js";
import { CACHE } from "@/lib/node-cache.js";

export async function getCacheOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = CACHE.get<T>(key);
  if (cached) {
    logger.info(`[CACHE] hit ${key}`);
    return cached;
  }
  logger.info(`[CACHE] miss ${key}`);
  const data = await fetcher();
  CACHE.set(key, data);
  logger.info(`[CACHE] set ${key}`);
  return data;
}

export function getCacheKey(prefix: string, obj: object) {
  return (
    prefix +
    ":" +
    Object.entries(obj)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => {
        if (v instanceof Date) return v.toISOString().split("T")[0];
        return String(v);
      })
      .join(":")
  );
}
