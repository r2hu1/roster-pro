import { Redis as UpstashRedis } from '@upstash/redis';

let redis: UpstashRedis | null = null;

const getClient = (): UpstashRedis => {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('Missing required redis configuration');
  }

  redis = new UpstashRedis({ url, token });
  return redis;
};

const parseValue = <T>(value: unknown): T | null => {
  if (value === null) return null;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }
  return value as T;
};

export const redisClient = {
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const client = getClient();
    if (ttlSeconds) {
      await client.set(key, JSON.stringify(value), { ex: ttlSeconds });
    } else {
      await client.set(key, JSON.stringify(value));
    }
  },

  async get<T = unknown>(key: string): Promise<T | null> {
    const client = getClient();
    const value: unknown = await client.get(key);
    return parseValue<T>(value);
  },

  async del(key: string): Promise<number> {
    const client = getClient();
    const result: unknown = await client.del(key);
    return Number(result);
  },

  async exists(key: string): Promise<boolean> {
    const client = getClient();
    const result: unknown = await client.exists(key);
    return Number(result) === 1;
  },

  async ttl(key: string): Promise<number> {
    const client = getClient();
    const result: unknown = await client.ttl(key);
    return Number(result);
  },

  async delPattern(pattern: string): Promise<number> {
    const client = getClient();
    const keys: string[] = await client.keys(pattern);
    if (keys.length === 0) return 0;

    const pipeline = client.pipeline();
    keys.forEach((k) => pipeline.del(k));
    await pipeline.exec();

    return keys.length;
  },

  async setMultiple(
    entries: Array<{ key: string; value: unknown; ttl?: number }>,
  ): Promise<void> {
    const client = getClient();
    const pipeline = client.pipeline();

    entries.forEach(({ key, value, ttl }) => {
      if (ttl) {
        pipeline.set(key, JSON.stringify(value), { ex: ttl });
      } else {
        pipeline.set(key, JSON.stringify(value));
      }
    });

    await pipeline.exec();
  },

  async getMultiple<T = unknown>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return [];

    const client = getClient();
    const pipeline = client.pipeline();
    keys.forEach((k) => pipeline.get(k));

    const results: unknown[] = await pipeline.exec();
    return results.map((v) => parseValue<T>(v));
  },
};
