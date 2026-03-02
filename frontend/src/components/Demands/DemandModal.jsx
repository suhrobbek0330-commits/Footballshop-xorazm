import React, { useState } from 'react';
import { X, PackageSearch, User, Phone } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const DemandModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        productName: '',
        requestedCount: 1,
        customerContact: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/demands', formData);
            toast.success('Talab muvaffaqiyatli saqlandi!');
            setFormData({ productName: '', requestedCount: 1, customerContact: '' });
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <PackageSearch className="text-indigo-600" /> Yangi Talab Qoldirish
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qidirilayotgan mahsulot</label>
                        <input
                            type="text"
                            name="productName"
                            required
                            placeholder="Masalan: Barselona formasi 2024"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.productName}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Miqdori</label>
                        <input
                            type="number"
                            name="requestedCount"
                            required
                            min="1"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.requestedCount}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <User size={16} /> Mijoz ma'lumotlari (Ism/Tel)
                        </label>
                        <input
                            type="text"
                            name="customerContact"
                            placeholder="Masalan: Alisher (+998 90...)"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.customerContact}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border rounded-xl hover:bg-gray-50 font-bold text-gray-600 transition"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition shadow-lg shadow-indigo-200"
                        >
                            Saqlash
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DemandModal;
