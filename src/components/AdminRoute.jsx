import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminRoute({ children }) {
    const { user, isAdmin, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div>Loading...</div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />
    }

    return children
}

export default AdminRoute
