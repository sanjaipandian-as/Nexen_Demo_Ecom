import Sidebar from '../components/Customer/Sidebar';
import Topbar from '../components/Customer/Topbar';
import Cart from '../components/Customer/Cart';
import Footer from '../components/Customer/Footer';

const CartPage = () => {
    return (
        <div className="flex w-full h-screen bg-gray-50 overflow-hidden">
            <Sidebar showFilter={false} />
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <Topbar />
                <Cart />
                <Footer />
            </div>
        </div>
    );
};

export default CartPage;
