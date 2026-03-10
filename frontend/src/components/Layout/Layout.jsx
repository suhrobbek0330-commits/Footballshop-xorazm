import Sidebar from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { LogOut } from 'lucide-react';

function Layout() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const isSimpleUser = user?.role === 'user';

    return (
        <div className="flex min-h-screen bg-slate-50">
            {!isSimpleUser && <Sidebar />}

            <main className={`${!isSimpleUser ? 'pl-64' : ''} w-full`}>
                {isSimpleUser && (
                    <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                        <div className="font-black text-xl text-indigo-600 tracking-tighter">FUTBOLSHOP</div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-gray-700">{user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
                            >
                                <LogOut size={18} />
                                Chiqish
                            </button>
                        </div>
                    </header>
                )}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;
