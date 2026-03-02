import { useState, useEffect } from 'react';
import { FaSignInAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, reset } from '../features/auth/authSlice';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        if (isSuccess || user) {
            navigate('/');
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        const userData = {
            email,
            password,
        };

        dispatch(login(userData));
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md glass-card p-10 rounded-3xl">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Football Shop Khorezm"
                            className="h-20 w-20 rounded-full object-cover shadow-xl ring-4 ring-indigo-100"
                        />
                        <div className="text-center">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">Football Shop</h2>
                            <p className="text-sm font-bold text-indigo-500 tracking-widest uppercase">Khorezm</p>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Xush kelibsiz! Tizimga kiring.</p>
                    </div>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={onSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-xl border-slate-200 py-3 pl-10 text-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                    value={email}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                    Password
                                </label>
                            </div>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-xl border-slate-200 py-3 pl-10 text-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                    value={password}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="btn-premium w-full py-3.5 text-lg"
                            >
                                Kirish
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Hisobingiz yo'qmi?{' '}
                        <Link to="/register" className="font-bold leading-6 text-indigo-600 hover:text-indigo-500 underline">
                            Ro'yxatdan o'tish
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
