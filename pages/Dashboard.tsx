import React, { useEffect, useState } from 'react';
import { DB } from '../services/db';
import { Card } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Home, Heart, AlertCircle } from 'lucide-react';
import { TransactionType, ExpenseCategory } from '../types';
import { useAppContext } from '../contexts/AppContext';

export const Dashboard = () => {
  const { t, theme } = useAppContext();
  const [stats, setStats] = useState({
    income: 0,
    expenses: 0,
    profit: 0,
    occupancy: 0,
    totalApartments: 0,
    totalTenants: 0,
    familySupport: 0
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [aptPerformance, setAptPerformance] = useState<any[]>([]);

  useEffect(() => {
    const transactions = DB.transactions.getAll();
    const apartments = DB.apartments.getAll();
    const tenants = DB.tenants.getAll();

    // Calculate High Level Stats
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    // Proposed Family Support Allocation (e.g., 10% of gross income)
    const proposedFamilySupport = income * 0.10;

    const occupiedApts = new Set(tenants.map(t => t.apartmentId)).size;
    const occupancy = apartments.length > 0 ? (occupiedApts / apartments.length) * 100 : 0;

    setStats({
      income,
      expenses,
      profit: income - expenses,
      occupancy,
      totalApartments: apartments.length,
      totalTenants: tenants.length,
      familySupport: proposedFamilySupport
    });

    // Prepare Chart Data (Monthly)
    const monthMap = new Map();
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      if (!monthMap.has(key)) monthMap.set(key, { name: key, income: 0, expense: 0 });
      
      const entry = monthMap.get(key);
      if (t.type === TransactionType.INCOME) entry.income += t.amount;
      else entry.expense += t.amount;
    });
    setMonthlyData(Array.from(monthMap.values()));

    // Per Apartment Performance
    const aptMap = new Map();
    apartments.forEach(a => aptMap.set(a.id, { name: a.name, profit: 0 }));
    transactions.forEach(t => {
      if (t.apartmentId && aptMap.has(t.apartmentId)) {
        const entry = aptMap.get(t.apartmentId);
        if (t.type === TransactionType.INCOME) entry.profit += t.amount;
        else entry.profit -= t.amount;
      }
    });
    setAptPerformance(Array.from(aptMap.values()));

  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);

  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    color: theme === 'dark' ? '#f8fafc' : '#1e293b'
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalIncome')}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.income)}</h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span className="font-medium">{t('grossRevenue')}</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('netProfit')}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.profit)}</h3>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
              <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
             <span className="font-medium">Exp: </span>
             <span className="text-red-600 dark:text-red-400 ml-1 font-bold">{formatCurrency(stats.expenses)}</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('familySupport')}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.familySupport)}</h3>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full">
              <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-pink-600 dark:text-pink-400">
            <span>{t('allocated')}</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('occupancyRate')}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.occupancy.toFixed(0)}%</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{stats.totalTenants} {t('activeTenants')}</span>
          </div>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t('financialOverview')}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 12}} tickFormatter={(val) => `€${val}`} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="income" name="Income" stroke="#4f46e5" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t('profitByApartment')}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aptPerformance} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fill: chartTextColor, fontSize: 12}} />
                <RechartsTooltip cursor={{fill: theme === 'dark' ? '#334155' : '#f8fafc'}} contentStyle={tooltipStyle} />
                <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

function Wallet(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v-8Z" />
    </svg>
  )
}