/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const COLOR_OPTIONS = ['Oq', 'Qora', "Ko'k", 'Qizil', 'Yashil', 'Sariq', 'Kulrang', 'Jigarrang', 'Binafsha', 'To\'q sariq'];

const DEFAULT_VARIANT = { size: 'L', color: 'Oq', quantity: 1 };

const ProductModal = ({ isOpen, onClose, onSave, product }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        originalPrice: 0,
        sellingPrice: 0,
        lowStockThreshold: 5
    });
    const [variants, setVariants] = useState([{ ...DEFAULT_VARIANT }]);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                category: product.category || '',
                originalPrice: product.originalPrice || 0,
                sellingPrice: product.sellingPrice || 0,
                lowStockThreshold: product.lowStockThreshold || 5
            });
            // Load existing variants
            if (product.variants && product.variants.length > 0) {
                setVariants(product.variants.map(v => ({
                    size: v.size || '',
                    color: v.color || '',
                    quantity: v.quantity || 0
                })));
            } else {
                // Eski mahsulot uchun: color/size dan variant yasash
                setVariants([{
                    size: product.size || '',
                    color: product.color || '',
                    quantity: product.quantity || 0
                }]);
            }
            // Fix image preview URL
            if (product.image) {
                // Biz vite proxy ishlatamiz (/uploads -> http://localhost:5000/uploads)
                // Shuning uchun rasm yo'lini o'zini (relative) ishlatish kifoya.
                setPreview(product.image);
            } else {
                setPreview(null);
            }
        } else {
            setFormData({
                name: '',
                category: '',
                originalPrice: 0,
                sellingPrice: 0,
                lowStockThreshold: 5
            });
            setVariants([{ ...DEFAULT_VARIANT }]);
            setPreview(null);
        }
        setImage(null);
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Variant o'zgartirish
    const handleVariantChange = (index, field, value) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // Yangi variant qo'shish
    const addVariant = () => {
        setVariants(prev => [...prev, { ...DEFAULT_VARIANT }]);
    };

    // Variant o'chirish
    const removeVariant = (index) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    // Jami miqdor
    const totalQty = variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();

        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('originalPrice', formData.originalPrice.toString());
        data.append('sellingPrice', formData.sellingPrice.toString());
        data.append('lowStockThreshold', formData.lowStockThreshold.toString());
        data.append('variants', JSON.stringify(variants));

        if (image) {
            data.append('image', image);
        }

        onSave(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Asosiy ma'lumotlar + Rasm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Chap — asosiy fieldlar */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Mahsulot nomi *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Masalan: Adidas F50 Futbolka"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategoriya *</label>
                                <input
                                    type="text"
                                    name="category"
                                    required
                                    placeholder="Futbolka, Shorta, Poyabzal..."
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.category}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Asl narxi (so'm) *</label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sotish narxi (so'm) *</label>
                                    <input
                                        type="number"
                                        name="sellingPrice"
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.sellingPrice}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Kam qolganlik chegarasi</label>
                                <input
                                    type="number"
                                    name="lowStockThreshold"
                                    min="0"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.lowStockThreshold}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* O'ng — Rasm */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Mahsulot rasmi</label>
                            <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-indigo-400 transition">
                                {preview ? (
                                    <>
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                                            <Upload className="text-white" size={28} />
                                            <span className="text-white text-sm font-medium">Rasmni o'zgartirish</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Upload size={36} />
                                        <span className="text-sm font-medium">Rasm yuklash</span>
                                        <span className="text-xs text-gray-300">JPG, PNG</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ===== VARIANTLAR ===== */}
                    <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-800">O'lcham & Rang variantlari</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Jami: <span className="font-semibold text-indigo-600">{totalQty} dona</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                            >
                                <Plus size={16} />
                                Variant qo'shish
                            </button>
                        </div>

                        {/* Ustun sarlavhalar */}
                        <div className="grid grid-cols-[1fr_1fr_90px_36px] gap-2 mb-2 px-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">O'lcham</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rang</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Miqdor</span>
                            <span></span>
                        </div>

                        {/* Variantlar ro'yxati */}
                        <div className="space-y-2">
                            {variants.map((v, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-[1fr_1fr_90px_36px] gap-2 items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
                                >
                                    {/* O'lcham */}
                                    <select
                                        value={v.size}
                                        onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                                        className="w-full px-2 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="">— tanlang —</option>
                                        {SIZE_OPTIONS.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                        <option value="custom">Boshqa...</option>
                                    </select>
                                    {/* Agar "Boshqa" tanlangan bo'lsa text input */}
                                    {v.size === 'custom' && (
                                        <input
                                            type="text"
                                            placeholder="O'lchamni kiriting"
                                            className="col-start-1 w-full px-2 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                                        />
                                    )}

                                    {/* Rang */}
                                    <div className="flex gap-1">
                                        <select
                                            value={COLOR_OPTIONS.includes(v.color) ? v.color : (v.color ? 'custom' : '')}
                                            onChange={(e) => {
                                                if (e.target.value !== 'custom') {
                                                    handleVariantChange(idx, 'color', e.target.value);
                                                }
                                            }}
                                            className="w-full px-2 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        >
                                            <option value="">— tanlang —</option>
                                            {COLOR_OPTIONS.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                            <option value="custom">Boshqa...</option>
                                        </select>
                                        {(!COLOR_OPTIONS.includes(v.color) && v.color !== '') || v.color === 'custom' ? (
                                            <input
                                                type="text"
                                                placeholder="Rang"
                                                value={v.color === 'custom' ? '' : v.color}
                                                onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                                                className="w-full px-2 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        ) : null}
                                    </div>

                                    {/* Miqdor */}
                                    <input
                                        type="number"
                                        min="0"
                                        value={v.quantity}
                                        onChange={(e) => handleVariantChange(idx, 'quantity', e.target.value)}
                                        className="w-full px-2 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-center font-semibold"
                                    />

                                    {/* O'chirish */}
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(idx)}
                                        disabled={variants.length === 1}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-end gap-3 pt-2 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-md shadow-indigo-600/20 transition"
                        >
                            Saqlash
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
