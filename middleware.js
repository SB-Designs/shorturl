import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = new URL(request.url);
  if (pathname === '/' || pathname.startsWith('/api') || pathname.includes('.')) return;

  const slug = pathname.slice(1);

  // Access environment variables directly
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/urls?short=eq.${slug}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  const data = await resp.json();

  if (data[0]?.long) {
    return NextResponse.redirect(data.long);
  }
  return NextResponse.next();
}
