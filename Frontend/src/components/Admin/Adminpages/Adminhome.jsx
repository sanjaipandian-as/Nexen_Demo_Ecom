import { useState } from 'react';
import Adminsidebar from '../components/Adminsidebar';
import AdminDashboard from '../components/AdminDashboard';
import AdminProductManagement from '../components/AdminProductManagement';
import AdminCategoryManagement from '../components/AdminCategoryManagement';
import AdminOrdersManagement from '../components/AdminOrdersManagement';
import AdminFinance from '../components/AdminFinance';
import AdminSettings from '../components/AdminSettings';
import ProductUploadModal from '../components/ProductUploadModal';

const Adminhome = () => {
    const [activePage, setActivePage] = useState('Dashboard');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [refreshId, setRefreshId] = useState(0);

    const handleNavigate = (page) => {
        setActivePage(page);
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
                return <AdminProductManagement onOpenUploadModal={handleOpenUploadModal} refreshId={refreshId} />;
            case 'Categories':
                return <AdminCategoryManagement refreshId={refreshId} />;
            case 'Orders':
                return <AdminOrdersManagement refreshId={refreshId} />;
            case 'Finance':
                return <AdminFinance refreshId={refreshId} />;
            case 'Settings':
                return <AdminSettings />;
            default:
                return <AdminDashboard onOpenUploadModal={handleOpenUploadModal} refreshId={refreshId} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Adminsidebar
                onNavigate={handleNavigate}
                activePage={activePage}
                onOpenUploadModal={handleOpenUploadModal}
            />
            <div className="flex-1 overflow-y-auto">
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
