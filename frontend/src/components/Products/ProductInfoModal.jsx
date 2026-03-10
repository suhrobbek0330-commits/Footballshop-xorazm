import React from 'react';
import { X, ShoppingBag, Tag, Package, Box, Info } from 'lucide-react';

const ProductInfoModal = ({ isOpen, onClose, product, getImageUrl }) => {
    if (!isOpen || !product) return null;

    const totalQty = product.variants && product.variants.length > 0
        ? product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0)
        : (product.quantity || 0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-white/20 animate-in fade-in zoom-in duration-300">

                {/* Image Section */}
                <div className="md:w-1/2 bg-slate-100 relative group overflow-hidden">
                    {product.image ? (
                        <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag size={80} strokeWidth={1} />
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-xs font-black text-indigo-600 uppercase tracking-widest">
                            {product.category || 'Kategoriyasiz'}
                        </span>
                    </div>
                </div>

                {/* Info Section */}
                <div className="md:w-1/2 p-8 overflow-y-auto relative flex flex-col">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>

                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">{product.name}</h2>
                        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-lg">
                            <Tag size={16} strokeWidth={2.5} />
                            <span className="text-xl font-black">{(product.sellingPrice || 0).toLocaleString()} so'm</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Package size={16} />
                                <span className="text-[10px] uppercase font-bold tracking-wider">Jami miqdor</span>
                            </div>
                            <div className="text-xl font-bold text-slate-900">{totalQty} dona</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Box size={16} />
                                <span className="text-[10px] uppercase font-bold tracking-wider">Status</span>
                            </div>
                            <div className={`text-xl font-bold ${totalQty > 5 ? 'text-green-600' : 'text-red-500'}`}>
                                {totalQty > 5 ? 'Sotuvda' : 'Oz qoldi'}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Info size={16} className="text-indigo-500" />
                            Mavjud Variantlar
                        </h3>

                        {product.variants && product.variants.length > 0 ? (
                            <div className="grid gap-2">
                                {product.variants.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                                                {v.size || '—'}
                                            </div>
                                            <span className="font-bold text-slate-700">{v.color || 'Noma\'lum'}</span>
                                        </div>
                                        <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black">
                                            {v.quantity} dona
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-sm font-medium">
                                Variantlar mavjud emas
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfoModal;
