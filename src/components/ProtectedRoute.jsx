import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

/**
 * ProtectedRoute - Wrapper for admin-only routes
 * Redirects non-admin users to home page
 */
function ProtectedRoute({ children }) {
    const { user, isAdmin, loading } = useAuth()

    // Show loading screen while checking authentication
    if (loading) {
        return <LoadingScreen />
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Redirect to home if authenticated but not admin
    if (!isAdmin) {
        return <Navigate to="/" replace />
    }

    // Render protected content for admin users
    return children
}

export default ProtectedRoute
