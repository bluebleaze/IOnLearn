import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.user_cache.json');

function readCache(): Record<string, any> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading cache file:', e);
  }
  return {};
}

function writeCache(data: Record<string, any>): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing cache file:', e);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  const cache = readCache();
  const userData = cache[email] || null;

  return NextResponse.json({ data: userData });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, tasks, preferences, aiConfig, todos, notes } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const cache = readCache();
    cache[email] = {
      tasks: tasks || [],
      preferences: preferences || null,
      aiConfig: aiConfig || null,
      todos: todos || [],
      notes: notes || [],
      updatedAt: new Date().toISOString(),
    };
    writeCache(cache);

    return NextResponse.json({ success: true, updatedAt: cache[email].updatedAt });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to save cache' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const cache = readCache();
    if (cache[email]) {
      delete cache[email];
      writeCache(cache);
    }

    return NextResponse.json({ success: true, message: `Account data for ${email} has been deleted.` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete cache' }, { status: 500 });
  }
}
