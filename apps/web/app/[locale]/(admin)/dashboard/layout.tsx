'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Mail, 
  MessageSquare,
  HelpCircle, 
  LogOut,
  ChevronRight,
  Home,
  BookOpen
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Müraciətlər', icon: Users, href: '/dashboard/leads' },
  { name: 'Mesajlar', icon: MessageSquare, href: '/dashboard/contacts' },
  { name: 'Kurslar', icon: BookOpen, href: '/dashboard/courses' },
  { name: 'Bloq', icon: FileText, href: '/dashboard/blog' },
  { name: 'Newsletter', icon: Mail, href: '/dashboard/newsletter' },
  { name: 'FAQ', icon: HelpCircle, href: '/dashboard/faq' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, isLoading, router, locale]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0">
        <div className="p-6">
          <Link href={`/${locale}/dashboard`} className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-slate-900">C</span>
            Cahan Admin
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const fullHref = `/${locale}${item.href}`;
            const isActive = item.href === '/dashboard' 
              ? pathname === fullHref 
              : pathname === fullHref || pathname.startsWith(fullHref + '/');
            return (
              <Link
                key={item.name}
                href={fullHref}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link
              href={`/${locale}`}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium"
            >
              <Home size={18} />
              Ana səhifəyə qayıt
            </Link>
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              Çıxış
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
