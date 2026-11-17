import { LocalStorageAdapter } from './LocalStorageAdapter.js';
import { R2StorageAdapter } from './R2StorageAdapter.js';

/**
 * Storage Factory
 * Resolves active storage adapter based on environment configuration.
 * 
 * Production Fail-Closed Rules:
 * 1. If STORAGE_PROVIDER=r2, missing credentials or unavailable SDK must FAIL startup immediately.
 * 2. In production, STORAGE_PROVIDER must be explicitly configured ("r2", "local", or "persistent").
 *    Silent fallback from R2 to local storage is strictly forbidden.
 * 3. LocalStorageAdapter is active only when explicitly configured or running in non-production environments.
 */
let activeAdapter = null;

export function validateStorageConfiguration() {
  const isProduction = process.env.NODE_ENV === 'production';
  const providerRaw = process.env.STORAGE_PROVIDER;
  const provider = (providerRaw || (isProduction ? '' : 'local')).toLowerCase().trim();

  if (isProduction) {
    if (!providerRaw || !provider) {
      throw new Error(
        '[FATAL CRITICAL SECURITY]: Production environment requires an explicit STORAGE_PROVIDER setting ("r2", "local", or "persistent"). Production will not default to ephemeral local storage accidentally.'
      );
    }
  }

  if (provider === 'r2') {
    const r2 = new R2StorageAdapter();
    const validation = r2.validateConfiguration();
    if (!validation.valid) {
      throw new Error(
        `[FATAL CRITICAL SECURITY]: Cloudflare R2 requested (STORAGE_PROVIDER=r2) but configuration is incomplete: ${validation.missing.join(', ')}. Silent fallback to local storage is strictly forbidden.`
      );
    }
  } else if (provider !== 'local' && provider !== 'persistent') {
    throw new Error(
      `[FATAL CRITICAL SECURITY]: Unsupported STORAGE_PROVIDER: "${providerRaw}". Supported providers are "r2", "local", or "persistent".`
    );
  }

  return true;
}

export function getStorageAdapter() {
  if (!activeAdapter) {
    const isProduction = process.env.NODE_ENV === 'production';
    const providerRaw = process.env.STORAGE_PROVIDER;
    const provider = (providerRaw || (isProduction ? '' : 'local')).toLowerCase().trim();

    if (provider === 'r2') {
      const r2Adapter = new R2StorageAdapter();
      const validation = r2Adapter.validateConfiguration();
      if (!validation.valid) {
        throw new Error(
          `[StorageFactory FATAL]: Cloudflare R2 configuration invalid: ${validation.message}. Silent fallback to local storage is strictly forbidden.`
        );
      }
      activeAdapter = r2Adapter;
    } else if (provider === 'local' || provider === 'persistent') {
      activeAdapter = new LocalStorageAdapter();
    } else if (!isProduction && !providerRaw) {
      activeAdapter = new LocalStorageAdapter();
    } else {
      throw new Error(
        `[StorageFactory FATAL]: Unsupported STORAGE_PROVIDER: "${providerRaw}". Must be "r2" or "local".`
      );
    }
  }
  return activeAdapter;
}

export { StorageAdapter } from './StorageAdapter.js';
export { LocalStorageAdapter } from './LocalStorageAdapter.js';
export { R2StorageAdapter } from './R2StorageAdapter.js';
