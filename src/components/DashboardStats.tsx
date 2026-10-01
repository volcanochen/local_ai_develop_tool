import React from 'react';
import { Mic, FileText, CheckCircle, Shield, Cpu, Clock } from 'lucide-react';

interface DashboardStatsProps {
  totalPlans: number;
  completedPlans: number;
  activeTasks: number;
  uptime: string;
}

export default function DashboardStats({ totalPlans, completedPlans, activeTasks, uptime }: DashboardStatsProps) {
  const stats = [
    {
      label: '执行计划',
      value: totalPlans,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
    {
      label: '已完成',
      value: completedPlans,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
    },
    {
      label: '活跃任务',
      value: activeTasks,
      icon: Cpu,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
    },
    {
      label: '安全运行',
      value: uptime,
      icon: Shield,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon size={18} className={stat.textColor} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
          <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
