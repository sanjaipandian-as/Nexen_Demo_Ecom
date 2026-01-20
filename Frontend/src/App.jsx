import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import React, { Suspense, lazy } from 'react';
import AppSkeleton from './components/Common/AppSkeleton';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
const Homepage = lazy(() => import('./pages/Homepage'));
import './App.css'
import Login from './components/Customer/Login'
import Register from './components/Customer/Register'
import Settings from './pages/Settings'
import Adminlogin from './components/Admin/components/Adminlogin'
import Adminhome from './components/Admin/Adminpages/Adminhome'
import Productview from './components/Customer/Prouductview'
import Payment from './components/Customer/Payment'
import Checkout from './components/Customer/Checkout'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import SearchResults from './pages/SearchResults'
import PrivacyPolicy from "./components/Customer/Policys/PrivacyPolicy"
import TermsAndConditions from './components/Customer/Policys/TermsAndConditions'
import Support from './components/Customer/Policys/Support'
import Affiliate from "./components/Customer/Affiliate"
import BrandRegistry from "./components/Customer/BrandRegistry"
import Shipping from "./components/Customer/Policys/Shipping"
import Returns from "./components/Customer/Policys/Returns"
import TrackOrder from "./components/Customer/Policys/TrackOrder"
import FAQs from "./components/Customer/Policys/FAQs"
import AboutUs from "./components/Customer/Company/AboutUs"
import Contact from "./components/Customer/Company/Contact"
import CategoriesSpecificpage from "./components/Customer/Landing/CategoriesSpecificpage"
import ShopProductsPage from "./pages/ShopProductsPage"

import {
  ProtectedCustomerRoute,
  ProtectedAdminRoute,
  PublicRoute
} from './components/Customer/ProtectedRoute'
import useDocumentTitle from './hooks/useDocumentTitle'

const DocumentTitleUpdater = () => {
  useDocumentTitle();
  return null;
};

function App() {
  return (
    <Router>
      <DocumentTitleUpdater />
      <Suspense fallback={<AppSkeleton />}>
        <Routes>

          <Route path="/" element={<Homepage />} />
          <Route path="/product/:id" element={<Productview />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/category/:categorySlug" element={<CategoriesSpecificpage />} />
          <Route path="/shop/:sellerId" element={<ShopProductsPage />} />



          <Route
            path="/Login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/Register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/admin-login"
            element={
              <PublicRoute>
                <Adminlogin />
              </PublicRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedAdminRoute>
                <Adminhome />
              </ProtectedAdminRoute>
            }
          />


          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />


          <Route
            path="/Settings"
            element={
              <ProtectedCustomerRoute>
                <Settings />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/Cart"
            element={
              <ProtectedCustomerRoute>
                <CartPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/Wishlist"
            element={
              <ProtectedCustomerRoute>
                <WishlistPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedCustomerRoute>
                <Payment />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/Payment"
            element={
              <ProtectedCustomerRoute>
                <Payment />
              </ProtectedCustomerRoute>
            }
          />


          <Route path="/Support" element={<Support />} />
          <Route path="/Affiliate" element={<Affiliate />} />
          <Route path="/BrandRegistry" element={<BrandRegistry />} />
        </Routes>
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  )
}

export default App
