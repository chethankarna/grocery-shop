import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminRoute({ children }) {
    const { user, isAdmin, loading } = useAuth()

    console.log('🛡️ AdminRoute check:', {
        user: user?.email || 'No user',
        isAdmin,
        loading
    });

    // Show loading screen while checking auth
    if (loading) {
        return <LoadingScreen />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        console.log('AdminRoute: No user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // Redirect to home if not admin
    if (!isAdmin) {
        console.log('AdminRoute: User is not admin, redirecting to home');
        return <Navigate to="/" replace />;
    }

    // User is admin, render the protected component
    console.log('AdminRoute: User is admin, rendering admin panel');
    return children;
}

export default AdminRoute;
