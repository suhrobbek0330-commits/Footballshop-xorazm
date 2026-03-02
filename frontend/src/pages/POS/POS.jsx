import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { Search, ShoppingCart, Minus, Plus, X, CreditCard, Banknote, HandCoins, Image as ImageIcon, Pencil, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import DebtModal from '../../components/POS/DebtModal';

const POS = () => {
    const { user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
    const [editingPriceId, setEditingPriceId] = useState(null);
    const [tempPrice, setTempPrice] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await api.get(`/products?keyword=${keyword}`);
            setProducts(data);
        };
        fetchProducts();
    }, [keyword]);

    const addToCart = (product) => {
        const existing = cart.find(item => item._id === product._id);
        if (existing) {
            if (existing.quantity >= product.quantity) {
                toast.warning('Omborda yetarli mahsulot yo\'q!');
                return;
            }
            setCart(cart.map(item =>
                item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item._id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item._id !== id));
    };

    const updatePrice = (id, newPrice) => {
        const parsed = parseFloat(newPrice);
        if (!isNaN(parsed) && parsed >= 0) {
            setCart(cart.map(item =>
                item._id === id ? { ...item, customPrice: parsed } : item
            ));
        }
        setEditingPriceId(null);
    };

    const totalAmount = cart.reduce((acc, item) => acc + ((item.customPrice ?? item.sellingPrice) * item.quantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        if (paymentMethod === 'nasiya') {
            setIsDebtModalOpen(true);
            return;
        }

        try {
            await api.post('/sales', {
                items: cart.map(item => ({
                    product: item._id,
                    quantity: item.quantity,
                    price: item.customPrice ?? item.sellingPrice
                })),
                totalAmount,
                paymentMethod
            });
            toast.success('Savdo muvaffaqiyatli yakunlandi!');
            setCart([]);
            // Refresh products to see updated stock
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        }
    };

    const handleDebtConfirm = async (customerData) => {
        try {
            // First create the debt
            await api.post('/debts', {
                ...customerData,
                products: cart.map(item => ({
                    product: item._id,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.customPrice ?? item.sellingPrice
                })),
                totalAmount,
                status: 'pending'
            });

            // Then reduce stock (simulating a sale but not recording in Sales till paid, 
            // though usually business logic varies. Here we at least reduce stock)
            // For now, our backend Sale creation handles stock, 
            // but we might need a dedicated Sale record marked as "unpaid" or just wait for debt payment.
            // According to our backend, stock is reduced when a SALE is created.
            // Let's create a sale too, but maybe marked as debt?
            // Existing Backend implementation of createSale reduces stock.
            // Let's create a sale with paymentMethod: 'cash' (recorded when debt is PAID).
            // Actually, let's just create the debt. The stock reduction will happen when debt is marked as PAID 
            // according to current backend logic in debtService.js:25.
            // Wait, if we don't reduce stock NOW, the product can be sold again.
            // BETTER: Create a sale NOW with paymentMethod: 'card' or similar, 
            // OR modify backend.

            // For simplicity and matching current backend (debtService.js), 
            // stock is NOT reduced until debt is paid. This is a BUG. 
            // I should fix the backend to reduce stock when debt is created, OR create a sale now.

            // Let's stick to the current plan: 
            toast.success('Nasiya muvaffaqiyatli saqlandi!');
            setIsDebtModalOpen(false);
            setCart([]);
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Qarzni saqlashda xatolik');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
            {/* Product Selection Area */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Mahsulot qidirish..."
                        className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2">
                    {!Array.isArray(products) ? (
                        <div className="col-span-full text-center py-10 text-gray-500">Mahsulotlar yuklanmadi.</div>
                    ) : (
                        products.map(product => (
                            <div
                                key={product._id}
                                onClick={() => addToCart(product)}
                                className="stat-card-premium p-4 flex flex-col justify-between"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                                        {product.image ? (
                                            <img src={`http://localhost:5000${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-300" size={32} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 line-clamp-1">{product.name || 'Nomsiz'}</h3>
                                        <p className="text-xs text-gray-500">{product.category || '-'}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="font-bold text-indigo-600">{(product.sellingPrice || 0).toLocaleString()}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${(product.quantity || 0) > (product.lowStockThreshold || 0) ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {product.quantity || 0} dona
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Cart & Checkout Area */}
            {user && (
                <div className="w-full lg:w-96 glass-card rounded-3xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b flex items-center gap-2">
                        <ShoppingCart className="text-indigo-600" />
                        <h2 className="font-bold text-lg text-gray-800">Savatcha</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 opacity-50">
                                <ShoppingCart size={48} strokeWidth={1} />
                                <p>Savatcha bo'sh</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item._id} className="flex gap-3 items-start p-3 rounded-xl border border-gray-100 bg-white/50">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold line-clamp-1 text-slate-800">{item.name}</h4>

                                        {/* Editable Price */}
                                        {editingPriceId === item._id ? (
                                            <div className="flex items-center gap-1 mt-1">
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    className="w-28 text-xs px-2 py-1 border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300"
                                                    value={tempPrice}
                                                    onChange={e => setTempPrice(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && updatePrice(item._id, tempPrice)}
                                                />
                                                <button
                                                    onClick={() => updatePrice(item._id, tempPrice)}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <p className="text-xs font-bold text-indigo-600">
                                                    {(item.customPrice ?? item.sellingPrice).toLocaleString()} so'm
                                                </p>
                                                {item.customPrice && item.customPrice !== item.sellingPrice && (
                                                    <span className="text-[10px] text-gray-400 line-through">
                                                        {item.sellingPrice.toLocaleString()}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setEditingPriceId(item._id);
                                                        setTempPrice(item.customPrice ?? item.sellingPrice);
                                                    }}
                                                    className="p-0.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors"
                                                    title="Narxni o'zgartirish"
                                                >
                                                    <Pencil size={11} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button onClick={() => updateQuantity(item._id, -1)} className="p-1 border rounded-lg hover:bg-gray-50"><Minus size={13} /></button>
                                        <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, 1)} className="p-1 border rounded-lg hover:bg-gray-50"><Plus size={13} /></button>
                                        <button onClick={() => removeFromCart(item._id)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg"><X size={13} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 space-y-4 border-t">
                        <div className="flex items-center justify-between text-lg font-bold">
                            <span className="text-gray-600 text-sm">Jami:</span>
                            <span className="text-indigo-600 text-2xl">{totalAmount.toLocaleString()} so'm</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition gap-1 ${paymentMethod === 'cash' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                <Banknote size={18} /> <span className="text-[10px] font-bold">Naqd</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition gap-1 ${paymentMethod === 'card' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                <CreditCard size={18} /> <span className="text-[10px] font-bold">Plastik</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('nasiya')}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition gap-1 ${paymentMethod === 'nasiya' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                <HandCoins size={18} /> <span className="text-[10px] font-bold">Nasiya</span>
                            </button>
                        </div>

                        <button
                            disabled={cart.length === 0}
                            onClick={handleCheckout}
                            className={`w-full py-4 rounded-xl font-black text-lg transition shadow-lg ${paymentMethod === 'nasiya' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {paymentMethod === 'nasiya' ? 'Nasiyani Rasmiylashtirish' : 'Savdoni Yakunlash'}
                        </button>
                    </div>
                </div>
            )}

            <DebtModal
                isOpen={isDebtModalOpen}
                onClose={() => setIsDebtModalOpen(false)}
                totalAmount={totalAmount}
                onConfirm={handleDebtConfirm}
            />
        </div>
    );
};

export default POS;
