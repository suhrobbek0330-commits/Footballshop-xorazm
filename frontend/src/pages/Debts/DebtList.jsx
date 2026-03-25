import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { User, Phone, Calendar, Clock, CheckCircle, AlertTriangle, Plus, Minus } from 'lucide-react';
import { toast } from 'react-toastify';

const DebtList = () => {
    const { user } = useSelector((state) => state.auth);
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        try {
            const { data } = await api.get('/debts');
            setDebts(data);
        } catch (error) {
            console.error(error);
            toast.error('Qarzlarni yuklashda xatolik!');
        } finally {
            setLoading(false);
        }
    };

    const markAsPaid = async (id) => {
        if (!window.confirm('To\'lov qabul qilinganini tasdiqlaysizmi?')) return;
        try {
            await api.put(`/debts/${id}/pay`, { status: 'paid' });
            toast.success('Qarz yopildi!');
            fetchDebts();
        } catch (error) {
            console.error('Payment error:', error);
            const message = error.response?.data?.message || 'To\'lovni amalga oshirishda xatolik yuz berdi';
            toast.error(message);
        }
    };

    const adjustAmount = async (id, currentAmount, delta) => {
        const newAmount = currentAmount + delta;
        if (newAmount < 0) return;

        try {
            await api.put(`/debts/${id}/amount`, { amount: newAmount });
            toast.success('Qarz miqdori yangilandi');
            setDebts(prev => prev.map(d => d._id === id ? { ...d, totalAmount: newAmount } : d));
        } catch (error) {
            console.error('Update amount error:', error);
            toast.error('Miqdorni yangilashda xatolik!');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Qarzlar Boshqaruvi</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <p>Yuklanmoqda...</p>
                ) : !Array.isArray(debts) || debts.length === 0 ? (
                    <p>Qarzlar mavjud emas.</p>
                ) : (
                    debts.map(debt => (
                        <div key={debt._id} className="bg-white rounded-2xl shadow-sm border p-6 space-y-4 hover:shadow-md transition relative overflow-hidden">
                            {/* Status logic */}
                            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold uppercase ${debt.status === 'paid' ? 'bg-green-100 text-green-700' :
                                debt.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {debt.status === 'paid' ? 'To\'langan' : debt.status === 'overdue' ? 'Kechikkan' : 'Kutilmoqda'}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-50 p-3 rounded-full">
                                    <User className="text-indigo-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{debt.customerName || 'Nomsiz'}</h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Phone size={14} /> {debt.phone || '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 py-2 border-y border-gray-50">
                                {Array.isArray(debt.products) && debt.products.map((p, idx) => (
                                    <div key={idx} className="flex justify-between text-sm text-gray-600">
                                        <span>{p.productName} (x{p.quantity})</span>
                                        <span>{((p.price || 0) * (p.quantity || 0)).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between font-bold text-lg pt-2 text-indigo-600">
                                    <span>Jami:</span>
                                    <div className="flex items-center gap-2">
                                        {debt.status !== 'paid' && (user?.role === 'admin' || user?.role === 'superadmin') && (
                                            <button
                                                onClick={() => adjustAmount(debt._id, debt.totalAmount, -1000)}
                                                className="p-1 hover:bg-red-50 text-red-500 rounded border border-red-200"
                                            >
                                                <Minus size={14} />
                                            </button>
                                        )}
                                        <span>{(debt.totalAmount || 0).toLocaleString()} so'm</span>
                                        {debt.status !== 'paid' && (user?.role === 'admin' || user?.role === 'superadmin') && (
                                            <button
                                                onClick={() => adjustAmount(debt._id, debt.totalAmount, 1000)}
                                                className="p-1 hover:bg-green-50 text-green-500 rounded border border-green-200"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Calendar size={16} />
                                    <span>Muddati: {debt.deadline ? new Date(debt.deadline).toLocaleDateString() : 'Belgilanmagan'}</span>
                                </div>
                                {debt.status !== 'paid' && (user?.role === 'admin' || user?.role === 'superadmin') && (
                                    <button
                                        onClick={() => markAsPaid(debt._id)}
                                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition text-xs font-bold"
                                    >
                                        <CheckCircle size={14} /> To'landi
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DebtList;
