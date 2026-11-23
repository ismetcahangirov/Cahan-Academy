import { getCourses, getTeachers } from '@/lib/api';
import { getContactSettings } from '@/lib/site';
import { absoluteUrl } from '@/lib/utils';

// Rebuilt at most once an hour, like the sitemap.
export const revalidate = 3600;

const clean = (s: string | null | undefined) => (s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const short = (s: string, max = 220) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

const LEVEL: Record<string, string> = { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced', all: 'all levels' };

/**
 * /llms.txt (llmstxt.org): a short Markdown map of the site for AI assistants. Built from the same API data as the
 * pages (courses, teachers) and the contact details from the admin panel, so it never says what the site does not.
 * The site is in Azerbaijani (no prefix), English (/en) and Russian (/ru); links point to the Azerbaijani pages.
 */
export async function GET() {
  const [courses, teachers, contact] = await Promise.all([getCourses('en'), getTeachers('en'), getContactSettings()]);

  const lines: string[] = [
    '# Cahan Academy',
    '',
    '> Education centre in Baku, Azerbaijan: courses in programming, design, languages and more. The site is in Azerbaijani, English (/en) and Russian (/ru).',
    '',
    `Contact: ${contact.phone} · ${contact.email} · ${contact.address.en}`,
    '',
    '## Pages',
    '',
    `- [Courses](${absoluteUrl('az', '/courses')}): the course catalogue with prices, duration and level`,
    `- [Teachers](${absoluteUrl('az', '/teachers')}): the academy's teachers`,
    `- [About](${absoluteUrl('az', '/about')}): history, mission and team`,
    `- [FAQ](${absoluteUrl('az', '/faq')}): questions about enrolment and lessons`,
    `- [Contact](${absoluteUrl('az', '/contact')}): phone, e-mail, address, opening hours and a contact form`,
    `- [Blog](${absoluteUrl('az', '/blog')}): articles`,
  ];

  if (courses.length > 0) {
    lines.push('', '## Courses', '');
    for (const c of courses) {
      const facts = [
        c.category?.name,
        LEVEL[c.level] ?? c.level,
        c.duration && clean(c.duration),
        c.price && clean(c.price),
        c.teacher?.name && `teacher: ${c.teacher.name}`,
      ].filter(Boolean);
      const desc = short(clean(c.description));
      lines.push(`- [${clean(c.title)}](${absoluteUrl('az', `/courses/${encodeURIComponent(c.slug)}`)}): ${facts.join(', ')}${desc ? `. ${desc}` : ''}`);
    }
  }

  if (teachers.length > 0) {
    lines.push('', '## Teachers', '');
    for (const t of teachers) {
      lines.push(`- [${clean(t.name)}](${absoluteUrl('az', `/teachers/${encodeURIComponent(t.slug)}`)})${t.position ? `: ${clean(t.position)}` : ''}`);
    }
  }

  lines.push(
    '',
    '## Optional',
    '',
    `- [Privacy policy](${absoluteUrl('az', '/privacy-policy')})`,
    `- [Terms of use](${absoluteUrl('az', '/terms')})`,
    `- [Sitemap](${absoluteUrl('az', '/sitemap.xml')})`,
    ''
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
