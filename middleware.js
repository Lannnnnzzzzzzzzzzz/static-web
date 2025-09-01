import { NextResponse } from 'next/server';

export async function middleware(request) {
  const url = request.nextUrl;
  const host = request.headers.get('host');
  
  // Lewati jika domain utama atau API route
  if (host === 'itsmeelann.web.id' || url.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Ekstrak subdomain
  const subdomain = host.replace('.itsmeelann.web.id', '');
  
  // Rewrite ke proxy API
  url.pathname = `/api/proxy/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
