import { describe, it, expect, beforeEach } from 'vitest';
import { contextCache, ContextCache } from '../../src/context/context-cache';
import type { ProjectContext } from '../../src/contracts/project-context';

describe('context-cache', () => {
  const testContext: ProjectContext = {
    root_path: '/test/path',
    project_name: 'test-project',
    tech_stack: ['typescript', 'nodejs'],
    language: 'typescript',
    dependencies: [],
    dev_dependencies: [],
    config_files: [],
    scripts: {},
    detected_at: new Date().toISOString(),
  };

  beforeEach(() => {
    contextCache.clear();
  });

  it('should return undefined for cache miss', () => {
    const result = contextCache.get('/nonexistent/path');
    expect(result).toBeUndefined();
  });

  it('should set and get context', () => {
    contextCache.set('/test/path', testContext);
    const result = contextCache.get('/test/path');
    expect(result).toEqual(testContext);
  });

  it('should delete context', () => {
    contextCache.set('/test/path', testContext);
    const deleted = contextCache.delete('/test/path');
    expect(deleted).toBe(true);
    expect(contextCache.get('/test/path')).toBeUndefined();
  });

  it('should clear all cache', () => {
    contextCache.set('/path1', testContext);
    contextCache.set('/path2', testContext);
    contextCache.clear();
    expect(contextCache.size()).toBe(0);
  });

  it('should track cache size', () => {
    expect(contextCache.size()).toBe(0);
    contextCache.set('/path1', testContext);
    expect(contextCache.size()).toBe(1);
    contextCache.set('/path2', testContext);
    expect(contextCache.size()).toBe(2);
  });

  it('should respect TTL and expire entries', async () => {
    const shortCache = new ContextCache(10); // 10ms TTL
    shortCache.set('/test/path', testContext);
    
    expect(shortCache.get('/test/path')).toEqual(testContext);
    
    await new Promise(resolve => setTimeout(resolve, 20));
    
    expect(shortCache.get('/test/path')).toBeUndefined();
  });

  it('should evict oldest entry when at max capacity', () => {
    const smallCache = new ContextCache(60000, 2);
    
    smallCache.set('/path1', testContext);
    smallCache.set('/path2', testContext);
    smallCache.set('/path3', testContext);
    
    expect(smallCache.get('/path1')).toBeUndefined();
    expect(smallCache.get('/path2')).toEqual(testContext);
    expect(smallCache.get('/path3')).toEqual(testContext);
  });
});