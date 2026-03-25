import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { PackageSearch, UserCheck, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const DemandList = () => {
    const { user } = useSelector((state) => state.auth);
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDemands();
    }, []);

    const fetchDemands = async () => {
        try {
            const { data } = await api.get('/demands');
            setDemands(data);
        } catch (error) {
            console.error(error);
            toast.error('Talablarni yuklashda xatolik!');
        } finally {
            setLoading(false);
        }
    };

    const handleFulfill = async (id) => {
        try {
            await api.put(`/demands/${id}/fulfill`);
            toast.success('Talab bajarildi deb belgilandi');
            fetchDemands();
        } catch (error) {
            console.error(error);
            toast.error('Xatolik yuz berdi');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Xaridor Talablari</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p>Yuklanmoqda...</p>
                ) : !Array.isArray(demands) || demands.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <PackageSearch className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">Hech qanday yangi talab topilmadi.</p>
                    </div>
                ) : (
                    demands.map(demand => (
                        <div key={demand._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-900">{demand.productName || 'Nomsiz'}</h3>
                                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                                        Qty: {demand.requestedCount || 0}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <UserCheck size={16} className="text-gray-400" />
                                    <span>{demand.customerContact || 'Noma\'lum xaridor'}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                                    <Clock size={16} />
                                    <span>Sana: {demand.createdAt ? new Date(demand.createdAt).toLocaleDateString() : '-'}</span>
                                </div>
                            </div>

                            {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                <button
                                    onClick={() => handleFulfill(demand._id)}
                                    className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition"
                                >
                                    <CheckCircle size={18} /> Bajarildi
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DemandList;
