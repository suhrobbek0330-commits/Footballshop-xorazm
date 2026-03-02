import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

function Layout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="pl-64 w-full">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;
