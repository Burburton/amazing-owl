import type { ProjectContext } from '../contracts/project-context';
import { createLogger } from '../utils/logger';

const logger = createLogger('context-cache');

interface CacheEntry {
  context: ProjectContext;
  timestamp: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 100;

class ContextCache {
  private cache = new Map<string, CacheEntry>();
  private ttlMs: number;
  private maxEntries: number;

  constructor(ttlMs: number = DEFAULT_TTL_MS, maxEntries: number = MAX_ENTRIES) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  get(rootPath: string): ProjectContext | undefined {
    const entry = this.cache.get(rootPath);
    
    if (!entry) {
      logger.debug('cache_miss', { root_path: rootPath });
      return undefined;
    }
    
    if (Date.now() - entry.timestamp > this.ttlMs) {
      logger.debug('cache_expired', { root_path: rootPath });
      this.cache.delete(rootPath);
      return undefined;
    }
    
    logger.debug('cache_hit', { root_path: rootPath });
    return entry.context;
  }

  set(rootPath: string, context: ProjectContext): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        logger.debug('cache_evicted', { root_path: oldestKey });
      }
    }
    
    this.cache.set(rootPath, {
      context,
      timestamp: Date.now(),
    });
    
    logger.debug('cache_set', { root_path: rootPath });
  }

  delete(rootPath: string): boolean {
    const result = this.cache.delete(rootPath);
    if (result) {
      logger.debug('cache_deleted', { root_path: rootPath });
    }
    return result;
  }

  clear(): void {
    this.cache.clear();
    logger.debug('cache_cleared');
  }

  size(): number {
    return this.cache.size;
  }
}

export const contextCache = new ContextCache();

export { ContextCache };