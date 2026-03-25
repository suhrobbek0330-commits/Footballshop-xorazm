import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Shield, UserCheck, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error('Foydalanuvchilarni yuklashda xatolik!');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            toast.success('Foydalanuvchi roli yangilandi');
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Rolni yangilashda xatolik yuz berdi');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Foydalanuvchilar Boshqaruvi</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                    <div key={user._id} className="stat-card-premium">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "p-3 rounded-xl",
                                    user.role === 'superadmin' ? "bg-purple-100 text-purple-600" :
                                        user.role === 'admin' ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"
                                )}>
                                    {user.role === 'superadmin' ? <ShieldCheck size={24} /> :
                                        user.role === 'admin' ? <Shield size={24} /> : <User size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Mail size={14} /> {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rolni O'zgartirish</label>
                            <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="user">User (Sotuvchi)</option>
                                <option value="admin">Admin (Omborchi)</option>
                                <option value="superadmin">Super Admin (Egasi)</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper function locally since clsx isn't imported here as a component prop but standard function
const clsx = (...classes) => classes.filter(Boolean).join(' ');

export default Users;
