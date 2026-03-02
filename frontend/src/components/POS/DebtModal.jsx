import React, { useState } from 'react';
import { X, Calendar, User, Phone, Info } from 'lucide-react';

const DebtModal = ({ isOpen, onClose, onConfirm, totalAmount }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        note: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b bg-amber-50">
                    <div>
                        <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                            <Info className="text-amber-600" /> Nasiya Rasmiylashtirish
                        </h2>
                        <p className="text-sm text-amber-700 font-medium">Umumiy summa: {totalAmount.toLocaleString()} so'm</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full transition-colors">
                        <X size={20} className="text-amber-900" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                            <User size={16} className="text-gray-400" /> Mijoz Ismi
                        </label>
                        <input
                            type="text"
                            name="customerName"
                            required
                            placeholder="Mijoz ismi va familiyasi..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                            value={formData.customerName}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" /> Telefon Raqami
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="+998 90 123 45 67"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" /> To'lov Muddati (Deadline)
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                            value={formData.deadline}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Izoh (ixtiyoriy)</label>
                        <textarea
                            name="note"
                            placeholder="Qo'shimcha ma'lumotlar..."
                            rows="2"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
                            value={formData.note}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 border border-gray-200 rounded-2xl hover:bg-gray-50 font-bold text-gray-600 transition-all active:scale-95"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3.5 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 font-bold transition-all shadow-lg shadow-amber-200 active:scale-95"
                        >
                            Tasdiqlash
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DebtModal;
