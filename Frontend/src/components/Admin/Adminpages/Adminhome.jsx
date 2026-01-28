import { useState } from 'react';
import Adminsidebar from '../components/Adminsidebar';
import AdminDashboard from '../components/AdminDashboard';
import AdminAllProducts from '../components/AdminAllProducts';
import AdminCategoryManagement from '../components/AdminCategoryManagement';
import AdminOrdersManagement from '../components/AdminOrdersManagement';
import AdminFinance from '../components/AdminFinance';
import AdminHeroManagement from '../components/AdminHeroManagement';
import AdminSettings from '../components/AdminSettings';
import ProductUploadModal from '../components/ProductUploadModal';

const Adminhome = () => {
    const [activePage, setActivePage] = useState('Dashboard');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [refreshId, setRefreshId] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

    const handleNavigate = (page) => {
        setActivePage(page);
        setIsSidebarOpen(false); // Close sidebar on mobile nav
    };

    const handleOpenUploadModal = () => {
        setShowUploadModal(true);
    };

    const triggerGlobalRefresh = () => {
        setRefreshId(prev => prev + 1);
    };

    const renderContent = () => {
        switch (activePage) {
            case 'Dashboard':
                return <AdminDashboard onOpenUploadModal={handleOpenUploadModal} refreshId={refreshId} />;
            case 'Products':
                return <AdminAllProducts refreshId={refreshId} />;
            case 'Categories':
                return <AdminCategoryManagement refreshId={refreshId} />;
            case 'Orders':
                return <AdminOrdersManagement refreshId={refreshId} triggerGlobalRefresh={triggerGlobalRefresh} />;
            case 'Hero Section':
                return <AdminHeroManagement refreshId={refreshId} />;
            case 'Finance':
                return <AdminFinance refreshId={refreshId} />;
            case 'Settings':
                return <AdminSettings />;
            default:
                return <AdminDashboard onOpenUploadModal={handleOpenUploadModal} refreshId={refreshId} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-40 px-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-white hover:bg-slate-800 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <span className="font-black tracking-tight text-lg">
                        <span className="text-[#E91E63]">AJIZZ</span> <span className="text-white">FASHIONS</span>
                    </span>
                </div>
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                    A
                </div>
            </div>

            <Adminsidebar
                onNavigate={handleNavigate}
                activePage={activePage}
                onOpenUploadModal={handleOpenUploadModal}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 overflow-y-auto pt-16 lg:pt-0 w-full">
                {renderContent()}
            </div>

            {/* Global Product Upload Modal */}
            <ProductUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={triggerGlobalRefresh}
            />
        </div>
    );
};

export default Adminhome;
