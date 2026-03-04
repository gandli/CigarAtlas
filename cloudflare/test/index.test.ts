import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('API Health Check', () => {
  it('should return API info on root path', async () => {
    const res = await app.request('/');
    const json = await res.json();
    
    expect(json.success).toBe(true);
    expect(json.data.name).toBe('CigarAtlas API');
    expect(json.data.version).toBe('1.0.0');
  });

  it('should return healthy status on /health', async () => {
    const res = await app.request('/health');
    const json = await res.json();
    
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('healthy');
  });

  it('should return API version info on /v1', async () => {
    const res = await app.request('/v1');
    const json = await res.json();
    
    expect(json.success).toBe(true);
    expect(json.data.version).toBe('v1');
    expect(json.data.endpoints).toBeDefined();
  });
});

describe('API Error Handling', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await app.request('/unknown-route');
    const json = await res.json();
    
    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });
});