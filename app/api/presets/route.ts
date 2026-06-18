import { NextResponse } from 'next/server';
import { getAllPresets, upsertPreset } from '@/lib/presetsStorage';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  const list = await getAllPresets();
  return NextResponse.json(list, { headers: CORS });
}

export async function POST(req: Request) {
  const body = await req.json();
  await upsertPreset(body);
  return NextResponse.json({ ok: true }, { headers: CORS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
