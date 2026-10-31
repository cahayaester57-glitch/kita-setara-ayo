
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Konfigurasi Supabase belum lengkap');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

const allowed = [
  '/',
  '/edukasi',
  '/studi-kasus',
  '/solusi',
  '/panduan-melapor',
  '/tentang'
];

export async function GET() {
  try {
    const { data, error } = await db()
      .from('site_pages')
      .select('slug,title,draft_content,published_content,published_at')
      .order('slug');

    if (error) throw error;

    return NextResponse.json({ pages: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal membaca halaman' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');

    if (
      !origin ||
      new URL(origin).host !== new URL(req.url).host
    ) {
      return NextResponse.json(
        { error: 'Permintaan lintas situs ditolak' },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (
      !body ||
      !allowed.includes(body.slug) ||
      !Array.isArray(body.content) ||
      body.content.length > 80
    ) {
      return NextResponse.json(
        { error: 'Data halaman tidak valid' },
        { status: 400 }
      );
    }

    const clean = body.content.map((b: any) => ({
      id: String(b.id || crypto.randomUUID()).slice(0, 100),
      type: ['hero', 'heading', 'text', 'card', 'cta', 'image']
        .includes(b.type) ? b.type : 'text',
      eyebrow: String(b.eyebrow || '').slice(0, 160),
      title: String(b.title || '').slice(0, 300),
      text: String(b.text || '').slice(0, 8000),
      buttonText: String(b.buttonText || '').slice(0, 100),
      buttonUrl:
        typeof b.buttonUrl === 'string' &&
        (b.buttonUrl.startsWith('/') ||
         b.buttonUrl.startsWith('https://'))
          ? b.buttonUrl.slice(0, 500) : '/',
      imageUrl:
        typeof b.imageUrl === 'string' &&
        (b.imageUrl.startsWith('/assets/') ||
         b.imageUrl.startsWith('https://'))
          ? b.imageUrl.slice(0, 800) : '',
      imageAlt: String(b.imageAlt || '').slice(0, 300),
      align: ['left', 'center', 'right'].includes(b.align)
        ? b.align : 'left',
      width: ['normal', 'wide', 'full'].includes(b.width)
        ? b.width : 'normal',
      bg: typeof b.bg === 'string' &&
        /^#[0-9a-fA-F]{6}$/.test(b.bg)
          ? b.bg : '#fbf7f3'
    }));

    const dbx = db();

    const { error } = await dbx
      .from('site_pages')
      .upsert({
        slug: body.slug,
        title: String(body.title || 'Halaman').slice(0, 120),
        draft_content: clean,
        updated_by: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' });

    if (error) throw error;

    if (body.publish === true) {
      const { error: pubError } = await dbx
        .from('site_pages')
        .update({
          published_content: clean,
          published_at: new Date().toISOString(),
          published_by: null
        })
        .eq('slug', body.slug);

      if (pubError) throw pubError;
    }

    return NextResponse.json({
      ok: true,
      published: body.publish === true
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal menyimpan halaman. Periksa database.' },
      { status: 500 }
    );
  }
}
