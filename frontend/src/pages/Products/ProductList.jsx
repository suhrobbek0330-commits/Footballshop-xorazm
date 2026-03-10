import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { Search, Plus, Filter, Edit2, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductModal from '../../components/Products/ProductModal';

// Rasm URLni to'g'rilash
const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    // Agar rasm yo'li / bilan boshlangan bo'lsa (masalan /uploads/...), 
    // Vite proxy orqali backendga o'tadi. Shuning uchun localhost:5000 shart emas.
    return imgPath;
};

// Variantlarni ixcham ko'rsatish
const renderVariants = (product) => {
    if (product.variants && product.variants.length > 0) {
        return product.variants.map((v, i) => (
            <span
                key={i}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium mr-1 mb-0.5"
            >
                {v.size && <span>{v.size}</span>}
                {v.size && v.color && <span className="text-indigo-300">/</span>}
                {v.color && <span>{v.color}</span>}
                <span className="text-indigo-400">×</span>
                <span className="font-bold">{v.quantity}</span>
            </span>
        ));
    }
    // Fallback: eski mahsulot
    const parts = [];
    if (product.size) parts.push(product.size);
    if (product.color) parts.push(product.color);
    return <span className="text-xs text-gray-400">{parts.join(' | ') || '—'}</span>;
};

import ProductInfoModal from '../../components/Products/ProductInfoModal';

const ProductList = () => {
    const { user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [keyword]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/products?keyword=${keyword}`);
            setProducts(data);
        } catch (error) {
            toast.error('Mahsulotlarni yuklashda xatolik!');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product, e) => {
        e.stopPropagation();
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const showDetails = (product) => {
        setSelectedProduct(product);
        setIsDetailModalOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            if (selectedProduct) {
                await api.put(`/products/${selectedProduct._id}`, formData);
                toast.success('Mahsulot yangilandi');
            } else {
                await api.post('/products', formData);
                toast.success("Yangi mahsulot qo'shildi");
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Saqlashda xatolik yuz berdi');
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("O'chirishni tasdiqlaysizmi?")) {
            try {
                await api.delete(`/products/${id}`);
                toast.success("Mahsulot o'chirildi");
                fetchProducts();
            } catch (error) {
                toast.error('Xatolik yuz berdi');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Ombor (Mahsulotlar)</h1>
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <button
                        onClick={handleAdd}
                        className="btn-premium flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Yangi qo'shish
                    </button>
                )}
            </div>

            {/* Qidiruv */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Nomi bo'yicha qidirish..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
            </div>

            {/* Jadval */}
            <div className="glass-card rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Mahsulot</th>
                            <th className="px-6 py-4">Kategoriya</th>
                            <th className="px-6 py-4">Variantlar</th>
                            <th className="px-6 py-4 text-right">Narxi</th>
                            <th className="px-6 py-4 text-center">Mavjud</th>
                            {(user?.role === 'admin' || user?.role === 'superadmin') && <th className="px-6 py-4 text-center">Boshqaruv</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-20 bg-white">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm font-bold text-slate-400">Yuklanmoqda...</span>
                                </div>
                            </td></tr>
                        ) : !Array.isArray(products) || products.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-20 text-slate-400 font-bold bg-white">Mahsulotlar topilmadi.</td></tr>
                        ) : (
                            products.map((product) => {
                                const totalQty = product.variants && product.variants.length > 0
                                    ? product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0)
                                    : (product.quantity || 0);

                                return (
                                    <tr
                                        key={product._id}
                                        className="hover:bg-indigo-50/30 transition-all cursor-pointer group"
                                        onClick={() => showDetails(product)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm border border-white group-hover:shadow-md transition-all">
                                                    {product.image ? (
                                                        <img
                                                            src={getImageUrl(product.image)}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <ImageIcon className="text-slate-300" size={22} />
                                                    )}
                                                </div>
                                                <div className="font-black text-slate-900 tracking-tight">{product.name || 'Nomsiz'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-wider">
                                                {product.category || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap max-w-[220px]">
                                                {renderVariants(product)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-black text-indigo-600 tracking-tight">{(product.sellingPrice || 0).toLocaleString()} so'm</div>
                                            {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                                <div className="text-[10px] uppercase font-bold text-slate-400">T: {(product.originalPrice || 0).toLocaleString()}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${totalQty <= (product.lowStockThreshold || 0)
                                                ? 'bg-red-50 text-red-600 border border-red-100'
                                                : 'bg-green-50 text-green-600 border border-green-100'
                                                }`}>
                                                {totalQty} dona
                                            </span>
                                        </td>
                                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={(e) => handleEdit(product, e)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100"
                                                    >
                                                        <Edit2 size={16} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(product._id, e)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 size={16} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                onSave={handleSave}
            />

            <ProductInfoModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                product={selectedProduct}
                getImageUrl={getImageUrl}
            />
        </div>
    );
};

export default ProductList;
