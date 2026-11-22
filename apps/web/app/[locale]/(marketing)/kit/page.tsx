import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, Plus, Trash2, X } from 'lucide-react';
import { BrandLockup, BrandLogo, BrandMark } from '@/components/brand';
import {
  BookmarkRibbon,
  CornerFlourish,
  DrapedRibbon,
  Edelweiss,
  EdelweissGlyph,
  LaceCorner,
  LaceEdge,
  OrnamentDivider,
  OrnateFrame,
  ScriptTitle,
  SKETCHES,
  SketchIllustration,
  Timeline,
  TimelineItem,
  WaveEdge,
  WaxSeal,
  type SketchName,
} from '@/components/ornament';
import { Badge, Button, Card, CardHeader, EmptyState, Skeleton, Spinner, StatusPill, Table } from '@/components/ui';
import { StatusDot } from '@/components/ui/Badge';
import CourseCard from '@/components/cards/CourseCard';
import TeacherCard from '@/components/cards/TeacherCard';
import BlogCard from '@/components/cards/BlogCard';
import type { Course } from '@/types/course';
import KitInteractive from './KitInteractive';

/*
 * /kit — live gallery of every token, primitive and ornament (design reference for page agents).
 * noindex, not in the sitemap. Section names are component identifiers; sample copy is Azerbaijani on
 * purpose (ə ğ ı İ ş ç ö ü in every face) and clearly sample data. Toggle the theme in the header to
 * see dark; screenshots cover both.
 */
export const metadata: Metadata = {
  title: 'Kit — Cahan Academy',
  robots: { index: false, follow: false },
};

const TOKENS = [
  ['page', 'bg-page'],
  ['surface', 'bg-surface'],
  ['surface-2', 'bg-surface-2'],
  ['surface-3', 'bg-surface-3'],
  ['paper', 'bg-paper'],
  ['accent', 'bg-accent'],
  ['accent-hover', 'bg-accent-hover'],
  ['accent-soft', 'bg-accent-soft'],
  ['ink', 'bg-ink'],
  ['ink-muted', 'bg-ink-muted'],
  ['ink-subtle', 'bg-ink-subtle'],
  ['line', 'bg-line'],
  ['line-strong', 'bg-line-strong'],
  ['line-hair', 'bg-line-hair'],
  ['ornament', 'bg-ornament'],
  ['ornament-soft', 'bg-ornament-soft'],
] as const;

const SAMPLE_COURSE: Course = {
  id: 'kit-1',
  slug: 'kit',
  title: 'Front-end proqramlaşdırma: əsaslardan peşəkar səviyyəyə',
  description: 'HTML, CSS, JavaScript və React ilə real layihələr üzərində işləyərək öyrənin.',
  price: '150 ₼',
  duration: '6 ay',
  level: 'beginner',
  image: null,
  isPopular: true,
  rating: '4.9',
  studentsCount: '24',
  category: { name: 'Proqramlaşdırma', slug: 'programming' },
  teacher: { name: 'Nümunə Müəllim', image: null, position: 'Front-end' },
};

function Block({ id, title, children, className }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={className ?? 'py-10'}>
      <h2 id={`${id}-h`} className="sc mb-5 flex items-center gap-2 text-[0.9rem] text-ink-muted">
        <EdelweissGlyph className="h-3.5 w-3.5" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function KitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <ScriptTitle
        size="page"
        eyebrow="Cahan Academy · design kit"
        title="Ornament dəsti"
        subtitle="Tokens · typography · primitives · ornaments"
        lead="Hər şey #5C000E, ağ və qara tonlarındadır. Mövzunu başlıqdakı düymə ilə dəyişin."
      />

      <Block id="tokens" title="Tokens">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {TOKENS.map(([name, cls]) => (
            <li key={name} className="card overflow-hidden">
              <div className={`h-14 border-b border-line ${cls}`} />
              <p className="px-2.5 py-2 font-mono text-[0.78rem] text-ink-muted">--{name}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block id="type" title="Typography">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="script-title text-[3.4rem]">Bilikli gələcək</p>
            <p className="script-title text-[2.4rem]">Öyrənmə yolu</p>
            <p className="sc text-[0.9rem] text-ink-muted">Kiçik başlıq · Giriş · İŞ · ŞƏRTLƏR</p>
          </div>
          <div className="space-y-3">
            <p className="text-[1.6rem] font-semibold leading-snug">EB Garamond 600 — Əsas başlıq, şəxs və kurs adları</p>
            <p className="text-[1.0625rem] leading-relaxed text-ink">
              Gövdə mətni: Peşəkar müəllimlər, praktiki dərslər. Ə ə Ğ ğ I ı İ i Ş ş Ç ç Ö ö Ü ü. Кириллица: Привет, мир.
            </p>
            <p className="text-ink-muted">İkinci dərəcəli mətn (ink-muted). <code>ink-subtle</code> yalnız placeholder, disabled və ikonlar üçündür (mətn üçün AA deyil).</p>
            <p className="num text-[1.4rem]">1 234 567 · 12.50 ₼ · 09:30</p>
            <p className="time-italic text-ink-muted">22 noyabr 2026 · 6 dəq oxu</p>
            <p>
              <a href="#type" className="link">
                Keçid nümunəsi
              </a>
            </p>
          </div>
        </div>
      </Block>

      <Block id="buttons" title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Bütün kurslar</Button>
          <Button variant="ghost">Ləğv et</Button>
          <Button variant="danger" icon={Trash2}>
            Sil
          </Button>
          <Button size="sm" icon={Plus}>
            Yeni
          </Button>
          <Button size="lg" iconAfter={ArrowRight}>
            Kurslara bax
          </Button>
          <Button loading>Göndərilir</Button>
          <Button disabled>Deaktiv</Button>
          <Button variant="ghost" iconOnly icon={X} aria-label="Bağla" />
        </div>
        <div className="theme-wine band-wine mt-6 flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] p-6">
          <Button>Primary (wine panel)</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Block>

      <Block id="badges" title="Badge · StatusPill · StatusDot">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Dizayn</Badge>
          <Badge tone="accent">Başlanğıc</Badge>
          <Badge tone="solid">Populyar</Badge>
          <span className="count-badge">3</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusPill status="success">Təsdiqləndi</StatusPill>
          <StatusPill status="partial">Davam edir</StatusPill>
          <StatusPill status="pending">Yeni</StatusPill>
          <StatusPill status="warning">Diqqət</StatusPill>
          <StatusPill status="excused">İstəyə bağlı</StatusPill>
          <StatusPill status="error">Rədd edildi</StatusPill>
          <StatusPill status="neutral">Arxiv</StatusPill>
          <StatusDot status="success" label="Aktiv" />
          <StatusDot status="pending" label="Gözləyir" />
        </div>
      </Block>

      <Block id="forms" title="FormField · Input · Select · Textarea · Checkbox · Modal · FAQAccordion">
        <KitInteractive />
      </Block>

      <Block id="cards" title="Card · OrnateFrame">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <CardHeader title="Plain" subtitle="Siyahı, cədvəl" />
            <p className="mt-3 text-ink-muted">Sadə çərçivə.</p>
          </Card>
          <Card variant="ornate" className="p-6">
            <CardHeader title="Ornate" subtitle="Xülasə" />
            <p className="mt-3 text-ink-muted">Daxili xətt və iki künc naxışı.</p>
          </Card>
          <Card variant="paper" className="p-6">
            <CardHeader title="Paper" subtitle="Oxu, forma" />
            <p className="mt-3 text-ink-muted">Perqament fon.</p>
          </Card>
          <Card variant="featured" className="p-6">
            <CardHeader title="Featured" subtitle="Bir görünüşdə bir dəfə" />
            <p className="mt-3 text-ink-muted">Əlfəcin lent.</p>
          </Card>
        </div>
        <OrnateFrame className="mt-6 p-8 text-center">
          <p className="script-title text-[2.2rem]">OrnateFrame</p>
          <OrnamentDivider className="mt-2" />
          <p className="mt-3 text-ink-muted">Dörd künc naxışı, daxili xətt, yumşaq daxili parıltı.</p>
        </OrnateFrame>
      </Block>

      <Block id="data-cards" title="CourseCard · TeacherCard · BlogCard (placeholder images → sketches)">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <li>
            <CourseCard course={SAMPLE_COURSE} featured />
          </li>
          <li>
            <TeacherCard teacher={{ name: 'Nümunə Müəllim', slug: 'kit', image: null, position: 'UI/UX dizayner' }} />
          </li>
          <li>
            <BlogCard
              post={{
                id: 'kit',
                slug: 'kit',
                title: 'Məqalə başlığı nümunəsi: iki sətrə sığan uzun başlıq',
                excerpt: 'Qısa giriş mətni burada görünür, üç sətirdən sonra kəsilir.',
                image: null,
                readingTime: '6 dəq',
                createdAt: '2026-11-22T10:00:00.000Z',
                author: { id: 'a', name: 'Redaksiya' },
              }}
            />
          </li>
        </ul>
      </Block>

      <Block id="table" title="Table · EmptyState · Skeleton · Spinner">
        <Table caption="Nümunə cədvəl">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Kurs</th>
              <th>Status</th>
              <th className="num">Məbləğ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Aygün Şirinova</td>
              <td>UI/UX dizayn</td>
              <td>
                <StatusPill status="pending">Yeni</StatusPill>
              </td>
              <td className="num">120.00</td>
            </tr>
            <tr>
              <td>İlqar Əhmədov</td>
              <td>Front-end</td>
              <td>
                <StatusPill status="success">Əlaqə saxlanılıb</StatusPill>
              </td>
              <td className="num">150.00</td>
            </tr>
          </tbody>
        </Table>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="card">
            <EmptyState sketch="cap" title="Hələ heç nə yoxdur" description="Boş vəziyyət: nə etmək lazım olduğunu bir cümlə ilə deyin." compact />
          </div>
          <div className="card space-y-3 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton />
            <Skeleton className="w-3/4" />
            <div className="flex items-center gap-4 pt-2">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" label="Yüklənir" />
            </div>
          </div>
        </div>
      </Block>

      <Block id="ornaments" title="Ornaments">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="card space-y-6 p-6">
            <OrnamentDivider />
            <OrnamentDivider align="start" />
            <OrnamentDivider motif="dot" draw={false} />
            <div className="flex items-center gap-6">
              <CornerFlourish corner="tl" className="h-10 w-10" />
              <CornerFlourish corner="tr" className="h-10 w-10" />
              <CornerFlourish corner="bl" className="h-10 w-10" />
              <CornerFlourish corner="br" className="h-10 w-10" />
              <Edelweiss className="h-12 w-12" />
              <EdelweissGlyph className="h-5 w-5" />
            </div>
            <div className="flex flex-wrap items-center gap-6 text-accent-text">
              <BrandMark className="h-12 w-auto" />
              <BrandLockup className="h-10 w-auto" />
              <BrandLogo className="h-28 w-auto" />
            </div>
          </div>
          <div className="card relative overflow-hidden p-6">
            <LaceEdge />
            <div className="mt-6 flex flex-wrap items-end gap-6">
              <LaceCorner corner="tl" className="w-28" />
              <WaxSeal size={80} />
              <div className="relative h-24 w-24 rounded-[var(--radius-md)] border border-line bg-surface">
                <BookmarkRibbon />
              </div>
              <DrapedRibbon className="w-48" />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-end justify-center gap-8">
          {(Object.keys(SKETCHES) as SketchName[]).map((s) => (
            <figure key={s} className="text-center">
              <SketchIllustration name={s} className="w-24 sm:w-28" />
              <figcaption className="sc mt-2 text-[0.75rem] text-ink-muted">{s}</figcaption>
            </figure>
          ))}
        </div>
      </Block>

      <Block id="timeline" title="Timeline">
        <OrnateFrame paper className="max-w-xl px-6 pb-3 pt-9">
          <Timeline>
            <TimelineItem time="I" title="Kursu seçin" meta="Tamamlanıb" state="done" />
            <TimelineItem time="II" title="Müraciət göndərin" meta="Cari addım" state="current" />
            <TimelineItem time="III" title="Dərslərə başlayın" meta="Qarşıdadır" />
            <TimelineItem time="IV" title="Ləğv edilmiş addım" state="cancelled" />
          </Timeline>
        </OrnateFrame>
      </Block>

      <Block id="wine" title=".theme-wine · WaveEdge · LaceEdge">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-line">
          <div className="theme-wine hero-wine relative px-6 pb-24 pt-12 text-center">
            <LaceCorner corner="tl" className="absolute left-0 top-0 w-28" />
            <LaceCorner corner="tr" className="absolute right-0 top-0 w-28" />
            <ScriptTitle align="center" size="section" eyebrow="Şərab paneli" title="Xoş gəlmisiniz" lead="Panel içində tokenlər tünd variantlara keçir." />
            <WaveEdge fill="var(--paper-base)" className="absolute inset-x-0 -bottom-px" />
          </div>
          <div className="paper px-6 py-10 text-center text-ink-muted">Perqament bölmə (paper)</div>
        </div>
      </Block>
    </div>
  );
}
