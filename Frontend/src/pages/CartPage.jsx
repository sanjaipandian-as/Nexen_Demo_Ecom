import Topbar from '../components/Customer/Topbar';
import Cart from '../components/Customer/Cart';
import Footer from '../components/Customer/Footer';

const CartPage = () => {
    return (
        <div className="flex flex-col w-full min-h-screen bg-gray-50">
            <Topbar />
            <div className="flex-1 w-full">
                <Cart />
                <Footer />
            </div>
        </div>
    );
};

export default CartPage;
