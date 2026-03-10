import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import {
    HomeIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    ClipboardDocumentListIcon,
    CreditCardIcon,
    UsersIcon,
    ArrowLeftOnRectangleIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
    { name: 'Bosh sahifa', href: '/', icon: HomeIcon, roles: ['superadmin'] },
    { name: 'Kassa', href: '/pos', icon: CurrencyDollarIcon, roles: ['admin', 'superadmin'] },
    { name: 'Mahsulotlar', href: '/products', icon: ShoppingBagIcon, public: true },
    { name: 'Qarzdorlar', href: '/debts', icon: CreditCardIcon, roles: ['admin', 'superadmin'] },
    { name: 'Buyurtmalar', href: '/demands', icon: ClipboardDocumentListIcon, roles: ['admin', 'superadmin'] },
    { name: 'Foydalanuvchilar', href: '/users', icon: UsersIcon, roles: ['superadmin'] },
];

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const filteredNavigation = navigation.filter(item =>
        item.public || (user && (!item.roles || item.roles.includes(user.role)))
    );

    return (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 border-r border-slate-800 px-6 pb-4 w-64 min-h-screen fixed shadow-2xl">
            <div className="flex h-20 shrink-0 items-center justify-center border-b border-slate-800/70">
                <img
                    src="/logo.png"
                    alt="Football Shop Khorezm"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-indigo-500/40 shadow-lg"
                />
                <div className="ml-2 leading-tight">
                    <div className="text-white text-sm font-black tracking-tight">FOOTBALL SHOP</div>
                    <div className="text-indigo-400 text-xs font-bold tracking-widest uppercase">Khorezm</div>
                </div>
            </div>

            <nav className="flex flex-1 flex-col pt-4">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1.5">
                            {filteredNavigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className={clsx(
                                            location.pathname === item.href
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 translate-x-1'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800 hover:translate-x-1',
                                            'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-bold transition-all duration-300'
                                        )}
                                    >
                                        <item.icon className={clsx(
                                            location.pathname === item.href ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400',
                                            "h-6 w-6 shrink-0 transition-colors"
                                        )} aria-hidden="true" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>

                    {/* User Profile & Logout Section */}
                    <li className="mt-auto -mx-2 bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                        {user ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-x-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/20">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-bold text-white truncate">{user?.name}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-black">{user?.role}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="flex w-full items-center gap-x-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-red-500 transition-all duration-300 group"
                                >
                                    <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                                    Chiqish
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="group flex w-full gap-x-3 rounded-xl p-3 text-sm leading-6 font-bold text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all duration-300 border border-indigo-600/20"
                            >
                                <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                Kirish
                            </Link>
                        )}
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;
