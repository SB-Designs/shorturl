import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = new URL(request.url);
  if (pathname === '/' || pathname.startsWith('/api') || pathname.includes('.')) return;
  const slug = pathname.slice(1);

  const resp = await fetch('https://YOUR_PROJECT_ID.supabase.co/rest/v1/urls?short=eq.' + slug, {
    headers: {
      'apikey': 'YOUR_SECRET_ANON_KEY',
      'Authorization': 'Bearer YOUR_SECRET_ANON_KEY'
    },
  });
  const data = await resp.json();

  if (data[0]?.long) {
    return NextResponse.redirect(data.long);
  }
  return NextResponse.next();
}
