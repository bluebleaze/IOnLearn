import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CACHE_FILE =
  process.env.VERCEL || process.env.NODE_ENV === 'production'
    ? path.join('/tmp', '.user_cache.json')
    : path.join(process.cwd(), '.user_cache.json');

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

  const normalized = email.toLowerCase().trim();
  const cache = readCache();
  const userData = cache[normalized] || cache[email] || null;

  return NextResponse.json({ data: userData });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      tasks,
      preferences,
      aiConfig,
      todos,
      notes,
      onboardingCompleted,
      spotlightCompleted,
      hasLoggedInBefore,
    } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const cache = readCache();
    const existing = cache[normalized] || {};

    const hasData =
      (tasks && tasks.length > 0) ||
      (todos && todos.length > 0) ||
      (notes && notes.length > 0) ||
      Boolean(preferences);

    const isDoneOnboarding =
      onboardingCompleted === true ||
      existing.onboardingCompleted === true ||
      hasData;

    const isDoneSpotlight =
      spotlightCompleted === true ||
      existing.spotlightCompleted === true ||
      (existing.onboardingCompleted === true && existing.spotlightCompleted !== false);

    cache[normalized] = {
      ...existing,
      tasks: tasks !== undefined ? tasks : (existing.tasks || []),
      preferences: preferences !== undefined ? preferences : (existing.preferences || null),
      aiConfig: aiConfig !== undefined ? aiConfig : (existing.aiConfig || null),
      todos: todos !== undefined ? todos : (existing.todos || []),
      notes: notes !== undefined ? notes : (existing.notes || []),
      onboardingCompleted: isDoneOnboarding,
      spotlightCompleted: isDoneSpotlight,
      hasLoggedInBefore: true,
      firstLoginAt: existing.firstLoginAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeCache(cache);

    return NextResponse.json({
      success: true,
      updatedAt: cache[normalized].updatedAt,
      onboardingCompleted: cache[normalized].onboardingCompleted,
      spotlightCompleted: cache[normalized].spotlightCompleted,
    });
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

    const normalized = email.toLowerCase().trim();
    const cache = readCache();
    let deleted = false;
    for (const key of Object.keys(cache)) {
      if (key.toLowerCase().trim() === normalized) {
        delete cache[key];
        deleted = true;
      }
    }
    if (deleted) {
      writeCache(cache);
    }

    return NextResponse.json({ success: true, message: `Account data for ${email} has been deleted.` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete cache' }, { status: 500 });
  }
}
