import Topbar from '../components/Customer/Topbar';
import Wishlist from '../components/Customer/Wishlist';
import Footer from '../components/Customer/Footer';

const WishlistPage = () => {
    return (
        <div className="flex flex-col w-full min-h-screen bg-gray-50">
            <Topbar />
            <div className="flex-1 w-full">
                <Wishlist />
            </div>
            <Footer />
        </div>
    );
};

export default WishlistPage;
