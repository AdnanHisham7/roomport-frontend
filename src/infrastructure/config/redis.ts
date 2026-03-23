import { Redis } from 'ioredis';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  console.log(redisClient)
  if (!redisClient) {
    redisClient = new Redis({
      host:          process.env.REDIS_HOST     || 'localhost',
      port:          parseInt(process.env.REDIS_PORT || '6379', 10),
      password:      process.env.REDIS_PASSWORD  || undefined,
      db:            parseInt(process.env.REDIS_DB   || '0', 10),
      retryStrategy: (times: number) => Math.min(times * 200, 3000),
    });

    redisClient.on('connect',      () => console.log('✅  Redis connected'));
    redisClient.on('error',        (err: Error) => console.error('❌  Redis error:', err.message));
    redisClient.on('reconnecting', () => console.warn('⚠️   Redis reconnecting...'));
  }

  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('🔌  Redis connection closed');
  }
};
