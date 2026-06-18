/**
 * Preset storage abstraction:
 * - Local dev (no KV env vars): uses data/presets.json via fs
 * - Vercel deployment (KV_REST_API_URL set): uses Vercel KV (Redis)
 */

const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const KV_KEY = 'design-yu-presets';

// File-system helpers (only used when useKV is false / local dev)
function readFile(): unknown[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path') as typeof import('path');
  const file = path.join(process.cwd(), 'data', 'presets.json');
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) as unknown[]; }
  catch { return []; }
}

function writeFile(data: unknown[]): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path') as typeof import('path');
  const file = path.join(process.cwd(), 'data', 'presets.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function getId(p: unknown): string {
  const x = p as Record<string, unknown>;
  return ((x.preset as Record<string, unknown>)?.id as string) || (x.id as string) || '';
}

export async function getAllPresets(): Promise<unknown[]> {
  if (useKV) {
    const { kv } = await import('@vercel/kv');
    return (await kv.get<unknown[]>(KV_KEY)) ?? [];
  }
  return readFile();
}

export async function upsertPreset(preset: unknown): Promise<void> {
  const list = await getAllPresets();
  const idx = list.findIndex(p => getId(p) === getId(preset));
  if (idx >= 0) list[idx] = preset;
  else list.unshift(preset);
  if (useKV) {
    const { kv } = await import('@vercel/kv');
    await kv.set(KV_KEY, list);
  } else {
    writeFile(list);
  }
}

export async function updatePreset(id: string, patch: unknown): Promise<void> {
  const list = await getAllPresets();
  const idx = list.findIndex(p => getId(p) === id);
  if (idx >= 0) {
    const existing = list[idx] as Record<string, unknown>;
    const p = patch as Record<string, unknown>;
    list[idx] = { ...existing, ...p };
    if (existing.preset && p.preset) {
      (list[idx] as Record<string, unknown>).preset = {
        ...(existing.preset as object),
        ...(p.preset as object),
      };
    }
  }
  if (useKV) {
    const { kv } = await import('@vercel/kv');
    await kv.set(KV_KEY, list);
  } else {
    writeFile(list);
  }
}

export async function deletePreset(id: string): Promise<void> {
  const list = (await getAllPresets()).filter(p => getId(p) !== id);
  if (useKV) {
    const { kv } = await import('@vercel/kv');
    await kv.set(KV_KEY, list);
  } else {
    writeFile(list);
  }
}
