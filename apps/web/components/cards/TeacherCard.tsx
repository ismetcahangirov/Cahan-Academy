'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ChevronRight, Github, Linkedin, Twitter } from 'lucide-react';
import { Teacher } from '@/types/teacher';

interface TeacherCardProps {
  teacher: Teacher;
  locale: string;
}

export default function TeacherCard({ teacher, locale }: TeacherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <Link href={`/teachers/${teacher.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={teacher.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'}
            alt={teacher.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          {/* Social Icons Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-500 delay-100">
            <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all">
              <Linkedin size={14} />
            </button>
            <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all">
              <Twitter size={14} />
            </button>
            <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all">
              <Github size={14} />
            </button>
          </div>
        </div>

        <div className="p-6 text-center">
          <h3 className="font-heading text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {teacher.name}
          </h3>
          <p className="text-sm text-muted-foreground font-medium mb-4">
            {teacher.position}
          </p>
          
          <div className="pt-4 border-t border-border flex items-center justify-center gap-2 text-primary text-sm font-bold group-hover:gap-4 transition-all">
            <span>Profilə bax</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
