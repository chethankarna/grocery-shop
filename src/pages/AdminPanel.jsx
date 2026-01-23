import { useAuth } from '../context/AuthContext'

function AdminPanel() {
    const { user, isAdmin } = useAuth()

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Admin Panel
            </h1>

            <div style={{
                backgroundColor: '#F3F4F6',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Welcome, Admin!
                </h2>
                <p style={{ color: '#6B7280' }}>
                    Email: {user?.email}
                </p>
                <p style={{ color: '#6B7280' }}>
                    Admin Status: {isAdmin ? 'Verified ✓' : 'Not Admin'}
                </p>
            </div>

            <div style={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '1.5rem'
            }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Admin Functions
                </h3>
                <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
                    This is a placeholder admin panel. You can add admin-specific functionality here such as:
                </p>
                <ul style={{
                    listStyleType: 'disc',
                    paddingLeft: '2rem',
                    color: '#374151',
                    lineHeight: '2'
                }}>
                    <li>Product Management (Add, Edit, Delete products)</li>
                    <li>Order Management (View and manage orders)</li>
                    <li>User Management</li>
                    <li>Analytics and Reports</li>
                    <li>Inventory Management</li>
                </ul>
            </div>
        </div>
    )
}

export default AdminPanel
