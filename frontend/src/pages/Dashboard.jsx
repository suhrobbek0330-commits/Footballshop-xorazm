import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Users, ShoppingCart, AlertCircle, ShoppingBag, Plus, Calendar
} from 'lucide-react';
import api from '../services/api';
import DemandModal from '../components/Demands/DemandModal';

const Dashboard = () => {
    const [period, setPeriod] = useState('daily');
    const [stats, setStats] = useState({
        summary: { totalRevenue: 0, totalSales: 0, itemsSold: 0 },
        categories: [],
        trend: []
    });
    const [loading, setLoading] = useState(true);
    const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/sales/stats?period=${period}`);
            setStats({
                summary: data?.summary || { totalRevenue: 0, totalSales: 0, itemsSold: 0 },
                categories: Array.isArray(data?.categories) ? data.categories : [],
                trend: Array.isArray(data?.trend) ? data.trend : []
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
            setStats({
                summary: { totalRevenue: 0, totalSales: 0, itemsSold: 0 },
                categories: [],
                trend: []
            });
        }
    };

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Boshqaruv Paneli</h1>
                    <p className="text-sm text-gray-500">Do'koningizning umumiy holati va hisobotlari</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    {[
                        { id: 'daily', label: 'Kun' },
                        { id: 'weekly', label: 'Hafta' },
                        { id: 'monthly', label: 'Oy' }
                    ].map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === p.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setIsDemandModalOpen(true)}
                    className="btn-premium flex items-center gap-2"
                >
                    <Plus size={20} /> Yangi Talab
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium font-bold">Ma'lumotlar yuklanmoqda...</p>
                </div>
            ) : (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Umumiy Savdo Hajmi"
                            value={`${stats?.summary?.totalVolume?.toLocaleString() || 0}`}
                            icon={<ShoppingBag className="text-indigo-500" />}
                            sub="Naqd + Nasiya"
                        />
                        <StatCard
                            title="Sof Foyda"
                            value={`${stats?.summary?.totalProfit?.toLocaleString() || 0}`}
                            icon={<TrendingUp className="text-green-500" />}
                            sub="Tan narxdan ayirilgan"
                        />
                        <StatCard
                            title="Tushum (Naqd/Card)"
                            value={`${stats?.summary?.totalRevenue?.toLocaleString() || 0}`}
                            icon={<ShoppingCart className="text-blue-500" />}
                            sub="Haqiqiy tushgan pul"
                        />
                        <StatCard
                            title="Kutilayotgan qarzlar"
                            value={`${stats?.summary?.pendingDebts?.toLocaleString() || 0}`}
                            icon={<AlertCircle className="text-orange-500" />}
                            sub="Hali to'lanmagan"
                        />
                    </div>

                    {/* Trend Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Savdo Trendi</h2>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                                {period === 'daily' ? 'Bugun' : period === 'weekly' ? 'Haftalik' : 'Oylik'}
                            </span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.trend || []}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                                        tickFormatter={(str) => period === 'daily' ? '' : str.split('-').slice(1).join('/')}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                                        tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val.toLocaleString()}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(val) => [`${val.toLocaleString()} so'm`, 'Savdo']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Categories Bar Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Kategoriyalar bo'yicha</h2>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.categories || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Bar dataKey="totalRevenue" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Daromad" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Sotuv ulushi</h2>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.categories || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="count"
                                            nameKey="_id"
                                        >
                                            {(stats?.categories || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <DemandModal
                isOpen={isDemandModalOpen}
                onClose={() => setIsDemandModalOpen(false)}
                onSuccess={fetchStats}
            />
        </div>
    );
};

const StatCard = ({ title, value, icon, sub }) => (
    <div className="stat-card-premium">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-500">{title}</span>
            <div className="p-2 bg-indigo-50 rounded-lg">
                {icon}
            </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        <p className="text-xs font-medium text-slate-400 mt-1">{sub}</p>
    </div>
);

export default Dashboard;
