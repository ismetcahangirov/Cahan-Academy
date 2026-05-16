import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

async function getTeamMembers(locale?: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/team?locale=${locale ?? 'az'}`, { next: { tags: ['team'], revalidate: 86400 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function TeamSection() {
  const t = await getTranslations('about');
  const locale = await getLocale() as 'az' | 'en' | 'ru';
  let members: any[] = [];

  try {
    members = await getTeamMembers(locale);
  } catch (error) {
    console.error('Team members fetch error:', error);
  }

  return (
    <section className="py-24 bg-foreground/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t('team_title')}</h2>
            <p className="text-foreground/60 text-lg">{t('team_subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member: any) => (
            <div key={member.id} className="group relative">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6">
                <Image
                  src={member.image || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=600'}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {member.name}
              </h3>
              <p className="text-foreground/50 font-medium">
                {member.position}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
