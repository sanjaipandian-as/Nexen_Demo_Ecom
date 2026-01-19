import Sidebar from '../components/Customer/Sidebar';
import Topbar from '../components/Customer/Topbar';
import Wishlist from '../components/Customer/Wishlist';
import Footer from '../components/Customer/Footer';

const WishlistPage = () => {
    return (
        <div className="flex w-full h-screen bg-gray-50">
            <Sidebar showFilter={false} />
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <Topbar />
                <div className="flex-1">
                    <Wishlist />
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default WishlistPage;
