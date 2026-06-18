import { NextResponse } from 'next/server';
import { upsertPreset, updatePreset, deletePreset } from '@/lib/presetsStorage';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  // PUT replaces the whole preset (used by plugin "웹에 저장")
  const preset = body as Record<string, unknown>;
  if (preset.preset) (preset.preset as Record<string, unknown>).id = id;
  else preset.id = id;
  await upsertPreset(preset);
  return NextResponse.json({ ok: true }, { headers: CORS });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  await updatePreset(id, body);
  return NextResponse.json({ ok: true }, { headers: CORS });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deletePreset(id);
  return NextResponse.json({ ok: true }, { headers: CORS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
