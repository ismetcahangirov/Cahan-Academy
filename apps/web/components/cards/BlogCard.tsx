'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import Image from 'next/image';
import { BlogPost } from '@/types/blog';
import { useTranslations } from 'next-intl';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const t = useTranslations('blog');

  const formattedDate = new Date(post.createdAt).toLocaleDateString('az-AZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <motion.div
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Image */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800'}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 text-[13px] text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={15} className="text-primary" />
            <span suppressHydrationWarning>{formattedDate}</span>
          </div>
          {post.readingTime && (
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-primary" />
              <span>{post.readingTime}</span>
            </div>
          )}
        </div>

        <h3 className="font-heading text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
          {post.title}
        </h3>

        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 h-15">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-border/60">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary">
                <User size={16} />
             </div>
             <span className="text-sm font-medium">{post.author?.name || 'Cahan Academy'}</span>
          </div>
          <Link 
            href={`/blog/${post.slug}`}
            aria-label={`${post.title} — ${t('read_more')}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-primary hover:text-white transition-all duration-300 font-semibold text-sm group/btn"
          >
            {t('read_more')}
            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
