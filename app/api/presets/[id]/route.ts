import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'presets.json');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function read(): unknown[] {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')); }
  catch { return []; }
}
function write(data: unknown[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}
function getId(p: unknown): string {
  const x = p as Record<string, unknown>;
  return ((x.preset as Record<string, unknown>)?.id as string) || (x.id as string) || '';
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const list = read();
  const idx = list.findIndex(p => getId(p) === id);
  if (idx >= 0) list[idx] = body;
  write(list);
  return NextResponse.json({ ok: true }, { headers: CORS });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = read().filter(p => getId(p) !== id);
  write(list);
  return NextResponse.json({ ok: true }, { headers: CORS });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const list = read();
  const idx = list.findIndex(p => getId(p) === id);
  if (idx >= 0) {
    const p = list[idx] as Record<string, unknown>;
    // Merge patch into existing preset
    list[idx] = { ...p, ...body };
    if (p.preset && body.preset) {
      (list[idx] as Record<string, unknown>).preset = { ...(p.preset as object), ...(body.preset as object) };
    }
  }
  write(list);
  return NextResponse.json({ ok: true }, { headers: CORS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
