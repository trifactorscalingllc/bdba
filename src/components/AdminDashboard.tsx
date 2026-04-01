import { motion } from 'framer-motion';
import { BarChart3, Users, MousePointer2, TrendingUp, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Visitors', value: '12,482', change: '+12%', icon: Users },
    { label: 'Video Watch Rate', value: '68%', change: '+5%', icon: BarChart3 },
    { label: 'Form Starts', value: '1,240', change: '-2%', icon: MousePointer2 },
    { label: 'Whop Conversions', value: '312', change: '+18%', icon: TrendingUp },
  ];

  return (
    <section className="py-24 px-4 bg-brand-black border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-sm font-black text-brand-gold tracking-[0.3em] uppercase mb-4">Admin View</h2>
            <h3 className="text-4xl font-black uppercase italic leading-none">Funnel Analytics</h3>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Live Status</div>
            <div className="flex items-center gap-2 text-brand-gold font-bold">
              <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 glass-card bg-black/40 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <stat.icon size={20} className="text-brand-gold" />
                <span className={cn(
                  "technical-label px-2 py-1 bg-white/5 rounded-full",
                  stat.change.startsWith('+') ? "text-brand-gold" : "text-red-500"
                )}>
                  {stat.change}
                </span>
              </div>
              <div className="text-4xl font-black mb-2 italic leading-none">{stat.value}</div>
              <div className="technical-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="p-12 glass-card bg-black/40 backdrop-blur-xl">
          <h4 className="technical-label mb-12">Conversion Flow</h4>
          <div className="space-y-10">
            {[
              { step: 'Landing Page', count: 12482, percent: 100 },
              { step: 'Video Engagement', count: 8487, percent: 68 },
              { step: 'Form Initiated', count: 1240, percent: 10 },
              { step: 'Whop Redirect', count: 312, percent: 2.5 },
            ].map((flow, i) => (
              <div key={flow.step} className="relative">
                <div className="flex justify-between technical-label mb-3">
                  <span className="text-white">{flow.step}</span>
                  <span className="text-white/40">{flow.count.toLocaleString()} ({flow.percent}%)</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${flow.percent}%` }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                    className="h-full bg-brand-gold"
                  />
                </div>
                {i < 3 && (
                  <div className="absolute -bottom-7 left-4 text-red-500/40">
                    <ArrowDownRight size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
