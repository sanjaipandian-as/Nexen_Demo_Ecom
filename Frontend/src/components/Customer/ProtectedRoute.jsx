import { Navigate } from 'react-router-dom';

// Protected Route for Customers
export const ProtectedCustomerRoute = ({ children }) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

    if (!token || userRole !== 'customer') {
        return <Navigate to="/Login" replace />;
    }

    return children;
};

// Protected Route for Admins
export const ProtectedAdminRoute = ({ children }) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

    if (!token || userRole !== 'admin') {
        return <Navigate to="/admin-login" replace />;
    }

    return children;
};


export const PublicRoute = ({ children, redirectPath = '/' }) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    const currentPath = window.location.pathname;

    if (token && userRole) {
        // Only redirect if user is trying to access their own role's login page
        if (userRole === 'admin' && currentPath === '/admin-login') {
            return <Navigate to="/admin-Dashboard" replace />;
        } else if (userRole === 'customer' && (currentPath === '/Login' || currentPath === '/Register')) {
            return <Navigate to={redirectPath} replace />;
        }
    }

    return children;
};
