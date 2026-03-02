import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, reset } from '../features/auth/authSlice';
import { LockClosedIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { name, email, password, confirmPassword } = formData;

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

        if (password !== confirmPassword) {
            toast.error('Parollar mos kelmadi');
        } else {
            const userData = {
                name,
                email,
                password,
            };
            dispatch(register(userData));
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen text-indigo-600 font-bold italic">Yuklanmoqda...</div>;
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-3xl font-black leading-9 tracking-tight text-indigo-600 italic">
                    Football Shop
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Yangi hisob yaratish
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50">
                <form className="space-y-6" onSubmit={onSubmit}>
                    <div>
                        <label className="block text-sm font-bold leading-6 text-gray-900">Ism</label>
                        <div className="mt-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={onChange}
                                className="block w-full rounded-xl border-gray-200 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                placeholder="Ismingizni kiriting"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold leading-6 text-gray-900">Email</label>
                        <div className="mt-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={onChange}
                                className="block w-full rounded-xl border-gray-200 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                placeholder="example@mail.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold leading-6 text-gray-900">Parol</label>
                        <div className="mt-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={onChange}
                                className="block w-full rounded-xl border-gray-200 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold leading-6 text-gray-900">Parolni tasdiqlash</label>
                        <div className="mt-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={onChange}
                                className="block w-full rounded-xl border-gray-200 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-4 text-sm font-bold leading-6 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        Ro'yxatdan o'tish
                    </button>
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Hisobingiz bormi?{' '}
                    <Link to="/login" className="font-bold leading-6 text-indigo-600 hover:text-indigo-500 underline">
                        Kirish
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
