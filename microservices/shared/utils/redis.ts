import Redis from 'ioredis';
import { Logger } from './logger';
import { RedisConfig } from '../types';

export class RedisService {
  private redis: Redis;
  private logger: Logger;

  constructor(config: RedisConfig, serviceName: string) {
    this.logger = new Logger(serviceName);
    
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      retryDelayOnFailover: config.retryDelayOnFailover || 100,
      maxRetriesPerRequest: config.maxRetriesPerRequest || 3,
      lazyConnect: true
    });

    this.redis.on('connect', () => {
      this.logger.info('Connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', error);
    });
  }

  async connect(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redis.disconnect();
      this.logger.info('Disconnected from Redis');
    } catch (error) {
      this.logger.error('Failed to disconnect from Redis', error as Error);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.error(`Failed to get key ${key}`, error as Error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to set key ${key}`, error as Error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}`, error as Error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}`, error as Error);
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      await this.redis.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      this.logger.error(`Failed to set expiry for key ${key}`, error as Error);
      return false;
    }
  }

  async hget(hash: string, field: string): Promise<string | null> {
    try {
      return await this.redis.hget(hash, field);
    } catch (error) {
      this.logger.error(`Failed to hget ${hash}.${field}`, error as Error);
      return null;
    }
  }

  async hset(hash: string, field: string, value: string): Promise<boolean> {
    try {
      await this.redis.hset(hash, field, value);
      return true;
    } catch (error) {
      this.logger.error(`Failed to hset ${hash}.${field}`, error as Error);
      return false;
    }
  }

  async hgetall(hash: string): Promise<Record<string, string>> {
    try {
      return await this.redis.hgetall(hash);
    } catch (error) {
      this.logger.error(`Failed to hgetall ${hash}`, error as Error);
      return {};
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`Failed to sadd to ${key}`, error as Error);
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      this.logger.error(`Failed to smembers ${key}`, error as Error);
      return [];
    }
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.redis.lpush(key, ...values);
    } catch (error) {
      this.logger.error(`Failed to lpush to ${key}`, error as Error);
      return 0;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.redis.rpop(key);
    } catch (error) {
      this.logger.error(`Failed to rpop from ${key}`, error as Error);
      return null;
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.redis.llen(key);
    } catch (error) {
      this.logger.error(`Failed to llen ${key}`, error as Error);
      return 0;
    }
  }

  // Session management helpers
  async setSession(sessionId: string, userId: string, ttlSeconds: number = 3600): Promise<boolean> {
    return await this.set(`session:${sessionId}`, userId, ttlSeconds);
  }

  async getSession(sessionId: string): Promise<string | null> {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.del(`session:${sessionId}`);
  }

  // Rate limiting helpers
  async incrementRateLimit(key: string, windowSeconds: number = 60): Promise<number> {
    try {
      const multi = this.redis.multi();
      multi.incr(key);
      multi.expire(key, windowSeconds);
      const results = await multi.exec();
      return results?.[0]?.[1] as number || 0;
    } catch (error) {
      this.logger.error(`Failed to increment rate limit for ${key}`, error as Error);
      return 0;
    }
  }

  async getRateLimit(key: string): Promise<number> {
    try {
      const result = await this.redis.get(key);
      return parseInt(result || '0', 10);
    } catch (error) {
      this.logger.error(`Failed to get rate limit for ${key}`, error as Error);
      return 0;
    }
  }
}



