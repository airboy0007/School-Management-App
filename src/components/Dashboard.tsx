import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wallet, 
  Receipt, 
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn, formatPKR } from '../lib/utils';

const mockRevenueData = [
  { month: 'Jan', revenue: 450000, expenses: 320000 },
  { month: 'Feb', revenue: 520000, expenses: 340000 },
  { month: 'Mar', revenue: 480000, expenses: 310000 },
  { month: 'Apr', revenue: 610000, expenses: 380000 },
  { month: 'May', revenue: 550000, expenses: 350000 },
  { month: 'Jun', revenue: 670000, expenses: 400000 },
];

const mockRecentTransactions = [
  { id: '1', name: 'Ahmed Khan', grade: 'Grade 9', amount: 4500, type: 'Fee Payment', date: '2 mins ago' },
  { id: '2', name: 'K-Electric', grade: 'Utility', amount: 12500, type: 'Expense', date: '1 hour ago' },
  { id: '3', name: 'Sara Ali', grade: 'Grade 5', amount: 3500, type: 'Fee Payment', date: '3 hours ago' },
  { id: '4', name: 'Zainab Bibi', grade: 'Staff', amount: 25000, type: 'Salary', date: '5 hours ago' },
];

import { Student, FeeRecord, Expense } from '../types';

interface DashboardProps {
  students: Student[];
  fees: FeeRecord[];
  expenses: Expense[];
}

export default function Dashboard({ students, fees, expenses }: DashboardProps) {
  const totalRevenue = fees.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingFees = fees.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  const currentExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const studentCount = students.filter(s => s.status === 'Active').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Command Center</h2>
        <p className="text-gray-500">Overview of Parwaaz e Shaheen Academy's performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatPKR(totalRevenue)} 
          trend="+12.5%" 
          trendUp={true}
          icon={TrendingUp}
          description="Total collected fees"
        />
        <StatCard 
          title="Pending Fees" 
          value={formatPKR(pendingFees)} 
          trend="+4.2%" 
          trendUp={false}
          icon={Wallet}
          description="Awaiting collection"
        />
        <StatCard 
          title="Current Expenses" 
          value={formatPKR(currentExpenses)} 
          trend="-2.1%" 
          trendUp={true}
          icon={Receipt}
          description="Total logged expenses"
        />
        <StatCard 
          title="Total Students" 
          value={studentCount.toString()} 
          trend="+18" 
          trendUp={true}
          icon={Users}
          description="Active enrollments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Financial Growth</h3>
            <select className="text-sm border-gray-200 rounded-lg focus:ring-0 focus:border-gray-300">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#151619" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#151619" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  tickFormatter={(value) => `Rs ${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [formatPKR(value), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#151619" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {mockRecentTransactions.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  item.type === 'Fee Payment' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {item.type === 'Fee Payment' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.grade} • {item.type}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-mono font-bold",
                    item.type === 'Fee Payment' ? "text-green-600" : "text-red-600"
                  )}>
                    {item.type === 'Fee Payment' ? '+' : '-'}{item.amount}
                  </p>
                  <p className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                    <Clock size={10} /> {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon: Icon, description }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-lg text-[#151619]">
          <Icon size={20} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {trend}
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        </div>
      </div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h4 className="text-2xl font-bold mt-1 font-mono">{value}</h4>
      <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
  );
}

