
'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

type Block = {
  id: string;
  type: 'hero' | 'heading' | 'text' | 'card' | 'cta' | 'image';
  eyebrow: string;
  title: string;
  text: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  imageAlt: string;
  align: 'left' | 'center' | 'right';
  width: 'normal' | 'wide' | 'full';
  bg: string;
};

type Page = {
  slug: string;
  title: string;
  blocks: Block[];
};

const titles: Record<string, string> = {
  '/': 'Beranda',
  '/edukasi': 'Edukasi & Hukum',
  '/studi-kasus': 'Studi Kasus',
  '/solusi': 'Solusi',
  '/panduan-melapor': 'Panduan Melapor',
  '/tentang': 'Tentang'
};

const seed = (slug: string): Block[] => {
  const mk = (
    id: string,
    type: Block['type'],
    title: string,
    text: string,
    eyebrow = '',
    align: Block['align'] = 'left',
    bg = '#fbf7f3',
    width: Block['width'] = 'normal'
  ): Block => ({
    id: id + '-' + slug,
    type,
    eyebrow,
    title,
    text,
    buttonText: 'Pelajari lebih lanjut',
    buttonUrl: '/edukasi',
    imageUrl: '/assets/alya.png',
    imageAlt: 'Ilustrasi Kita Setara',
    align,
    width,
    bg
  });

  const common: Record<string, Block[]> = {
    '/': [
      mk('hero', 'hero', 'Hak yang setara.\nKesempatan yang sama.', 'Setiap orang berhak bekerja dengan bermartabat. Kenali hakmu, pahami ketidakadilan, dan temukan cara ikut membangun lingkungan kerja yang inklusif.', 'Ruang belajar untuk dunia kerja yang adil', 'left', '#f7eded', 'wide'),
      mk('intro', 'heading', 'Mengapa Kita Setara?', ''),
      mk('gender', 'card', 'Kesempatan tanpa bias', 'Kesetaraan berarti akses yang adil pada tugas, upah, promosi, dan suara dalam pengambilan keputusan.', '01 / GENDER'),
      mk('disabilitas', 'card', 'Ruang kerja yang aksesibel', 'Inklusi membutuhkan aksesibilitas, akomodasi yang layak, dan penilaian berdasarkan kompetensi.', '02 / DISABILITAS'),
      mk('action', 'cta', 'Lingkungan kerja yang adil dimulai dari kita.', 'Kenali aturan, dukung sesama, dan jadikan rasa hormat sebagai kebiasaan.', 'Perubahan dimulai dari kesadaran', 'center', '#f4e8e9')
    ],

    '/edukasi': [
      mk('hero', 'hero', 'Kenali hakmu.', 'Database ringkas hukum dan prinsip hak warga negara dalam lingkungan kerja.', 'Pustaka hak warga', 'left', '#f7eded', 'wide'),
      mk('pasal28d1', 'card', 'Pasal 28D ayat (1)', 'Setiap orang berhak atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil serta perlakuan yang sama di hadapan hukum.', 'UUD NRI 1945'),
      mk('pasal28d2', 'card', 'Pasal 28D ayat (2)', 'Setiap orang berhak untuk bekerja serta mendapat imbalan dan perlakuan yang adil dan layak dalam hubungan kerja.', 'UUD NRI 1945'),
      mk('pasal28e3', 'card', 'Pasal 28E ayat (3)', 'Setiap orang berhak atas kebebasan berserikat, berkumpul, dan mengeluarkan pendapat.', 'UUD NRI 1945'),
      mk('pasal28h2', 'card', 'Pasal 28H ayat (2)', 'Setiap orang berhak mendapat kemudahan dan perlakuan khusus untuk memperoleh kesempatan dan manfaat yang sama guna mencapai persamaan dan keadilan.', 'UUD NRI 1945')
    ],

    '/studi-kasus': [
      mk('hero', 'hero', 'Ketidakadilan punya wajah nyata.', 'Dua isu yang mengingatkan kita bahwa kesempatan kerja belum selalu setara.', 'Realitas di tempat kerja', 'left', '#f7eded', 'wide'),
      mk('gender', 'card', 'Diskriminasi gender terhadap jurnalis perempuan', 'AJI mengangkat persoalan diskriminasi gender yang dialami jurnalis perempuan di perusahaan media. Periksa publikasi asli untuk rincian temuan dan konteks.', 'ISU 01 · GENDER'),
      mk('disabilitas', 'card', 'Akses dan keadilan bagi penyandang disabilitas', 'Sumber LBH Jakarta menjadi rujukan isu disabilitas. Pastikan rincian peristiwa mengikuti publikasi asli.', 'ISU 02 · DISABILITAS')
    ],

    '/solusi': [
      mk('hero', 'hero', 'Kesetaraan perlu dirancang.', 'Solusi yang baik menjawab hambatan nyata dengan kebijakan, akses, dan pertanggungjawaban.', 'Dari sadar menjadi tindakan', 'left', '#f7eded', 'wide'),
      mk('gender', 'card', 'Kesetaraan gender', 'Gunakan kriteria rekrutmen dan promosi transparan; evaluasi kesetaraan upah; distribusikan tugas secara adil; sediakan mekanisme aman untuk melapor.', 'LANGKAH NYATA'),
      mk('disabilitas', 'card', 'Keadilan disabilitas', 'Audit aksesibilitas; sediakan akomodasi yang layak; lakukan seleksi berbasis kompetensi; libatkan pekerja disabilitas dalam evaluasi fasilitas.', 'LANGKAH NYATA')
    ],

    '/panduan-melapor': [
      mk('hero', 'hero', 'Kamu tidak harus menghadapinya sendiri.', 'Panduan awal untuk menata informasi dan mengenali pilihan bantuan.', 'Cari bantuan dengan aman', 'left', '#f7eded', 'wide'),
      mk('catat', 'card', '1. Catat secara faktual', 'Tulis kronologi sesegera mungkin. Pisahkan apa yang kamu alami, lihat, dengar, dan simpulkan.'),
      mk('bukti', 'card', '2. Simpan bukti dengan aman', 'Simpan salinan relevan dan lindungi data pribadi. Hindari mengunggah informasi sensitif secara publik.'),
      mk('pendamping', 'card', '3. Cari pendamping', 'Pertimbangkan orang tepercaya, serikat pekerja, bantuan hukum, atau layanan pendamping.'),
      mk('kanal', 'card', '4. Kenali kanal yang tersedia', 'Pastikan kanal dan prosedur terbaru, ruang lingkup kewenangan, serta persyaratan pelaporan.')
    ],

    '/tentang': [
      mk('hero', 'hero', 'Ruang belajar, ruang perubahan.', 'Kita Setara adalah proyek edukasi tentang hak warga negara, keadilan di lingkungan kerja, dan keberanian memahami persoalan dengan empati.', 'Tentang platform', 'left', '#f7eded', 'wide'),
      mk('tujuan', 'card', 'Tujuan', 'Membantu pengunjung memahami dasar hukum, mengenali diskriminasi, mengeksplorasi solusi, dan mempelajari opsi dukungan melalui informasi dan cerita interaktif.'),
      mk('nilai', 'card', 'Nilai kami', 'Martabat, kesetaraan, aksesibilitas, ketelitian, empati, dan keberanian untuk bertindak dengan bertanggung jawab.')
    ]
  };

  return common[slug] || [
    mk('hero', 'hero', titles[slug] || 'Halaman baru', '', 'KITA SETARA', 'left', '#f7eded', 'wide')
  ];
};

function SortableBlock({
  block,
  active,
  onSelect
}: {
  block: Block;
  active: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        border: active ? '2px solid #9c6479' : '1px solid #eadde1',
        borderRadius: 16,
        background: '#fff',
        marginBottom: 10,
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12 }}>
        <button
          {...attributes}
          {...listeners}
          aria-label="Geser bagian"
          style={{
            cursor: 'grab',
            border: 0,
            background: '#f5e8eb',
            borderRadius: 9,
            padding: '8px 10px'
          }}
        >
          ⠿
        </button>

        <button
          onClick={onSelect}
          style={{
            flex: 1,
            textAlign: 'left',
            border: 0,
            background: 'transparent',
            fontWeight: 700,
            color: '#4c3942'
          }}
        >
          {block.type.toUpperCase()} · {block.title || block.text.slice(0, 48) || 'Bagian baru'}
        </button>

        <span style={{ fontSize: 11, color: '#9b7482' }}>PILIH</span>
      </div>
    </div>
  );
}

export default function VisualEditor() {
  const [slug, setSlug] = useState('/');
  const [pages, setPages] = useState<Record<string, Page>>({});
  const [active, setActive] = useState('');
  const [status, setStatus] = useState('Memuat editor…');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const page = pages[slug] || {
    slug,
    title: titles[slug],
    blocks: seed(slug)
  };

  const block = page.blocks.find(b => b.id === active) || page.blocks[0];

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/pages');

        if (!r.ok) {
          throw new Error('Gagal membaca database');
        }

        const j = await r.json();
        const next: Record<string, Page> = {};

        Object.entries(titles).forEach(([s, t]) => {
          const row = j.pages?.find((x: any) => x.slug === s);

          next[s] = {
            slug: s,
            title: t,
            blocks: row?.draft_content || row?.published_content || seed(s)
          };
        });

        setPages(next);
        setActive(next['/'].blocks[0]?.id || '');
        setStatus('Draft dimuat. Perubahan belum tampil ke pengunjung.');
      } catch {
        setStatus('Tidak dapat memuat database. Periksa konfigurasi Supabase.');
      }
    })();
  }, []);

  function update(patch: Partial<Block>) {
    setPages(old => ({
      ...old,
      [slug]: {
        ...page,
        blocks: page.blocks.map(b =>
          b.id === active ? { ...b, ...patch } : b
        )
      }
    }));
  }

  function add(type: Block['type']) {
    const b: Block = {
      id: `${type}-${Date.now()}`,
      type,
      eyebrow: '',
      title: type === 'heading' ? 'Judul bagian' : '',
      text: 'Tulis isi konten di sini…',
      buttonText: 'Pelajari lebih lanjut',
      buttonUrl: '/edukasi',
      imageUrl: '/assets/alya.png',
      imageAlt: 'Ilustrasi Kita Setara',
      align: 'left',
      width: 'normal',
      bg: '#fbf7f3'
    };

    setPages(o => ({
      ...o,
      [slug]: {
        ...page,
        blocks: [...page.blocks, b]
      }
    }));

    setActive(b.id);
  }

  function remove() {
    if (!block) return;

    const arr = page.blocks.filter(b => b.id !== active);

    setPages(o => ({
      ...o,
      [slug]: { ...page, blocks: arr }
    }));

    setActive(arr[0]?.id || '');
  }

  function dragEnd(e: any) {
    if (!e.over || e.active.id === e.over.id) return;

    const old = page.blocks.findIndex(b => b.id === e.active.id);
    const next = page.blocks.findIndex(b => b.id === e.over.id);

    setPages(o => ({
      ...o,
      [slug]: {
        ...page,
        blocks: arrayMove(page.blocks, old, next)
      }
    }));
  }

  async function persist(publish: boolean) {
    setBusy(true);
    setStatus(publish ? 'Menerbitkan…' : 'Menyimpan draft…');

    try {
      const r = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slug,
          title: page.title,
          content: page.blocks,
          publish
        })
      });

      const j = await r.json();

      if (!r.ok) {
        throw new Error(j.error || 'Gagal menyimpan');
      }

      setStatus(
        publish
          ? 'Berhasil dipublikasikan. Pengunjung akan melihat versi terbaru.'
          : 'Draft berhasil disimpan. Belum tampil untuk pengunjung.'
      );
    } catch (e: any) {
      setStatus(e.message || 'Terjadi kesalahan.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="editorShell">
      <header className="editorTop">
        <div>
          <div className="eyebrow">KITA SETARA · FULL VISUAL EDITOR</div>
          <b>Ruang kendali konten</b>
        </div>

        <div className="editorActions">
          <button className="editorBtn" onClick={() => setPreview(!preview)}>
            {preview ? 'Tutup preview' : 'Preview'}
          </button>

          <button
            className="editorBtn"
            disabled={busy}
            onClick={() => persist(false)}
          >
            Simpan draft
          </button>

          <button
            className="editorPublish"
            disabled={busy}
            onClick={() => persist(true)}
          >
            Publish ↗
          </button>
        </div>
      </header>

      <div className="editorStatus" role="status">
        {status}
      </div>

      <div className={`editorGrid ${preview ? 'previewMode' : ''}`}>
        <aside className="editorSide">
          <label>Halaman yang diedit</label>

          <select
            value={slug}
            onChange={e => {
              setSlug(e.target.value);
              setActive(
                (pages[e.target.value]?.blocks || seed(e.target.value))[0]?.id || ''
              );
            }}
          >
            {Object.entries(titles).map(([s, t]) => (
              <option value={s} key={s}>{t}</option>
            ))}
          </select>

          <div className="sideTitle">STRUKTUR HALAMAN</div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={dragEnd}
          >
            <SortableContext
              items={page.blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {page.blocks.map(b => (
                <SortableBlock
                  key={b.id}
                  block={b}
                  active={b.id === active}
                  onSelect={() => setActive(b.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <div className="sideTitle">TAMBAH BAGIAN</div>

          <div className="addGrid">
            {(['hero', 'heading', 'text', 'card', 'cta', 'image'] as const).map(t => (
              <button
                key={t}
                className="addBtn"
                onClick={() => add(t)}
              >
                ＋ {
                  t === 'hero' ? 'Hero' :
                  t === 'heading' ? 'Judul' :
                  t === 'text' ? 'Teks' :
                  t === 'card' ? 'Kartu' :
                  t === 'cta' ? 'CTA' : 'Gambar'
                }
              </button>
            ))}
          </div>
        </aside>

        <section className="editorCanvas">
          <div className="canvasLabel">
            {preview ? 'PRATINJAU HALAMAN' : 'KANVAS · PILIH BAGIAN UNTUK MENGEDIT'}
          </div>

          {page.blocks.map(b => (
            <article
              key={b.id}
              className="canvasBlock"
              style={{
                background: b.bg,
                textAlign: b.align
              }}
            >
              {b.eyebrow && (
                <div className="eyebrow">{b.eyebrow}</div>
              )}

              {b.type === 'image' ? (
                <img
                  src={b.imageUrl}
                  alt={b.imageAlt}
                  style={{
                    maxHeight: 300,
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : b.type === 'hero' ? (
                <h1
                  className="serif"
                  style={{
                    fontSize: 'clamp(38px,5vw,66px)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {b.title}
                </h1>
              ) : b.type === 'heading' ? (
                <h2 className="serif" style={{ fontSize: 34 }}>
                  {b.title}
                </h2>
              ) : b.type === 'card' || b.type === 'cta' ? (
                <div className="surface">
                  <h3>{b.title}</h3>
                  <p className="muted">{b.text}</p>

                  {b.type === 'cta' && (
                    <span className="pill">
                      {b.buttonText || 'Pelajari lebih lanjut'} ↗
                    </span>
                  )}
                </div>
              ) : (
                <p
                  className="muted"
                  style={{
                    whiteSpace: 'pre-line',
                    fontSize: 17
                  }}
                >
                  {b.text}
                </p>
              )}
            </article>
          ))}
        </section>

        <aside className="editorProps">
          <div className="sideTitle">PENGATURAN BAGIAN</div>

          {block ? (
            <>
              <label>Jenis bagian</label>
              <select
                value={block.type}
                onChange={e => update({ type: e.target.value as Block['type'] })}
              >
                {['hero', 'heading', 'text', 'card', 'cta', 'image'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <label>Label kecil / eyebrow</label>
              <input
                value={block.eyebrow}
                onChange={e => update({ eyebrow: e.target.value })}
                placeholder="Contoh: TENTANG KAMI"
              />

              <label>Judul</label>
              <textarea
                rows={3}
                value={block.title}
                onChange={e => update({ title: e.target.value })}
                placeholder="Tulis judul…"
              />

              <label>Isi teks</label>
              <textarea
                rows={7}
                value={block.text}
                onChange={e => update({ text: e.target.value })}
                placeholder="Tulis isi bagian…"
              />

              <label>Perataan</label>
              <select
                value={block.align}
                onChange={e => update({ align: e.target.value as Block['align'] })}
              >
                <option value="left">Kiri</option>
                <option value="center">Tengah</option>
                <option value="right">Kanan</option>
              </select>

              <label>Lebar layout</label>
              <select
                value={block.width || 'normal'}
                onChange={e => update({ width: e.target.value as Block['width'] })}
              >
                <option value="normal">Konten standar</option>
                <option value="wide">Lebar</option>
                <option value="full">Penuh</option>
              </select>

              <label>Warna latar</label>

              <div className="colorRow">
                <input
                  type="color"
                  value={/^#[0-9a-f]{6}$/i.test(block.bg) ? block.bg : '#fbf7f3'}
                  onChange={e => update({ bg: e.target.value })}
                />

                <input
                  value={block.bg}
                  onChange={e => update({ bg: e.target.value })}
                />
              </div>

              {block.type === 'image' && (
                <>
                  <label>Alamat gambar</label>
                  <input
                    value={block.imageUrl}
                    onChange={e => update({ imageUrl: e.target.value })}
                    placeholder="/assets/nama-gambar.png atau https://…"
                  />

                  <label>Teks alternatif</label>
                  <input
                    value={block.imageAlt}
                    onChange={e => update({ imageAlt: e.target.value })}
                  />
                </>
              )}

              {block.type === 'cta' && (
                <>
                  <label>Teks tombol</label>
                  <input
                    value={block.buttonText}
                    onChange={e => update({ buttonText: e.target.value })}
                  />

                  <label>Tujuan tombol</label>
                  <input
                    value={block.buttonUrl}
                    onChange={e => update({ buttonUrl: e.target.value })}
                  />
                </>
              )}

              <button className="deleteBtn" onClick={remove}>
                Hapus bagian
              </button>
            </>
          ) : (
            <p className="muted">
              Pilih bagian di struktur halaman untuk mengeditnya.
            </p>
          )}

          <div className="notice" style={{ marginTop: 20 }}>
            Drag ikon ⠿ untuk mengubah urutan. Simpan draft untuk menyimpan pekerjaan.
            Klik Publish agar versi baru tampil untuk semua pengunjung.
          </div>
        </aside>
      </div>
    </main>
  );
}
