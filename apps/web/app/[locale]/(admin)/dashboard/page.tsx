'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import { 
  Users, 
  Mail, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Stats {
  counts: {
    leads: number;
    subscribers: number;
    posts: number;
    messages: number;
  };
  chartData: { date: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminApi.get('/admin/stats');
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-900 rounded-xl border border-slate-800"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-900 rounded-xl border border-slate-800"></div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Cəmi Müraciət', 
      value: stats?.counts.leads || 0, 
      icon: Users, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      trend: '+12%',
      isPositive: true
    },
    { 
      label: 'Abunəçilər', 
      value: stats?.counts.subscribers || 0, 
      icon: Mail, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      trend: '+5%',
      isPositive: true
    },
    { 
      label: 'Məqalələr', 
      value: stats?.counts.posts || 0, 
      icon: FileText, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      trend: '0%',
      isPositive: true
    },
    { 
      label: 'Mesajlar', 
      value: stats?.counts.messages || 0, 
      icon: MessageSquare, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10',
      trend: '-2%',
      isPositive: false
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Xoş gəldiniz!</h1>
        <p className="text-slate-400 text-sm">Cahan Academy platformasının ümumi vəziyyəti</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group">
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.trend}
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-500" />
              Müraciət Dinamikası (Son 7 gün)
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-white font-semibold mb-4">Son Fəallıq</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-800 last:border-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 shrink-0">
                  <ArrowUpRight size={16} />
                </div>
                <div>
                  <p className="text-sm text-slate-200">Yeni müraciət daxil oldu</p>
                  <p className="text-xs text-slate-500 mt-1">2 dəqiqə əvvəl</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
