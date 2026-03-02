import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, Users, ShoppingCart, AlertCircle, ShoppingBag, Plus
} from 'lucide-react';
import api from '../services/api';
import DemandModal from '../components/Demands/DemandModal';

const Dashboard = () => {
    const [stats, setStats] = useState({
        summary: { totalRevenue: 0, totalSales: 0, itemsSold: 0 },
        categories: []
    });
    const [loading, setLoading] = useState(true);
    const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/sales/stats?period=daily');
            // Ensure data has the expected structure even if the API returns an error or different format
            setStats({
                summary: data?.summary || { totalRevenue: 0, totalSales: 0, itemsSold: 0 },
                categories: Array.isArray(data?.categories) ? data.categories : []
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
            // Don't leave stats undefined
            setStats({
                summary: { totalRevenue: 0, totalSales: 0, itemsSold: 0 },
                categories: []
            });
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) return <div className="flex items-center justify-center min-h-[400px]">Yuklanmoqda...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Boshqaruv Paneli (Dashboard)</h1>
                <button
                    onClick={() => setIsDemandModalOpen(true)}
                    className="btn-premium flex items-center gap-2"
                >
                    <Plus size={20} /> Yangi Talab
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Umumiy Savdo Hajmi"
                    value={`${stats?.summary?.totalVolume?.toLocaleString() || 0} so'm`}
                    icon={<ShoppingBag className="text-indigo-500" />}
                    sub="Naqd + Nasiya"
                />
                <StatCard
                    title="Sof Foyda"
                    value={`${stats?.summary?.totalProfit?.toLocaleString() || 0} so'm`}
                    icon={<TrendingUp className="text-green-500" />}
                    sub="Tan narxdan ayirilgan"
                />
                <StatCard
                    title="Qabul qilingan to'lov"
                    value={`${stats?.summary?.totalRevenue?.toLocaleString() || 0} so'm`}
                    icon={<ShoppingCart className="text-blue-500" />}
                    sub="Faqat naqd va plastik"
                />
                <StatCard
                    title="Kutilayotgan qarzlar"
                    value={`${stats?.summary?.pendingDebts?.toLocaleString() || 0} so'm`}
                    icon={<AlertCircle className="text-orange-500" />}
                    sub="Hali to'lanmagan"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4">Kategoriyalar bo'yicha daromad</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.categories || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalRevenue" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Daromad" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4">Sotuv ulushi</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.categories || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {(stats?.categories || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

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
