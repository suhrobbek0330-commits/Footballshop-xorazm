import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { Search, Plus, Filter, Edit2, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductModal from '../../components/Products/ProductModal';

const ProductList = () => {
    const { user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        console.log('--- SENDING PRODUCT DATA ---');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        try {
            if (selectedProduct) {
                await api.put(`/products/${selectedProduct._id}`, formData);
                toast.success('Mahsulot yangilandi');
            } else {
                await api.post('/products', formData);
                toast.success('Yangi mahsulot qo\'shildi');
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Saqlashda xatolik yuz berdi');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('O\'chirishni tasdiqlaysizmi?')) {
            try {
                await api.delete(`/products/${id}`);
                toast.success('Mahsulot o\'chirildi');
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

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Nomi bo'yicha qidirish..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50">
                    <Filter size={18} />
                    Filtr
                </button>
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Mahsulot</th>
                            <th className="px-6 py-4">Kategoriya</th>
                            <th className="px-6 py-4">Narxi</th>
                            <th className="px-6 py-4">Miqdori</th>
                            {(user?.role === 'admin' || user?.role === 'superadmin') && <th className="px-6 py-4">Harakat</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10">Yuklanmoqda...</td></tr>
                        ) : !Array.isArray(products) || products.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-10">Mahsulotlar topilmadi.</td></tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {product.image ? (
                                                    <img src={`http://localhost:5000${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="text-gray-400" size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{product.name || 'Nomsiz'}</div>
                                                <div className="text-xs text-gray-500">{product.size || '-'} | {product.color || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.category || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-indigo-600">{(product.sellingPrice || 0).toLocaleString()} so'm</div>
                                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                            <div className="text-xs text-gray-400">Tan narx: {(product.originalPrice || 0).toLocaleString()}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.quantity <= (product.lowStockThreshold || 0)
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {product.quantity || 0} dona
                                        </span>
                                    </td>
                                    {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
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
        </div>
    );
};

export default ProductList;
