import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listenOrdersRealtime } from '../../services/ordersService';
import './AdminOrders.css';

function AdminOrdersList() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Redirect non-admin users
    useEffect(() => {
        if (!authLoading && (!user || !isAdmin)) {
            navigate('/');
        }
    }, [user, isAdmin, authLoading, navigate]);

    // Realtime listener for orders
    useEffect(() => {
        if (!user || !isAdmin) return;

        setLoading(true);
        setError(null);

        const unsubscribe = listenOrdersRealtime(
            (fetchedOrders) => {
                setOrders(fetchedOrders);
                setLoading(false);
            },
            { status: statusFilter !== 'ALL' ? statusFilter : null, limit: 100 }
        );

        return () => unsubscribe();
    }, [user, isAdmin, statusFilter]);

    // Filter orders by search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredOrders(orders);
            return;
        }

        const lowercaseSearch = searchTerm.toLowerCase();
        const filtered = orders.filter(order =>
            order.id.toLowerCase().includes(lowercaseSearch) ||
            order.customer_name?.toLowerCase().includes(lowercaseSearch) ||
            order.customer_phone?.includes(searchTerm) ||
            order.userEmail?.toLowerCase().includes(lowercaseSearch)
        );
        setFilteredOrders(filtered);
    }, [orders, searchTerm]);

    // Helper functions
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-IN');
    };

    const formatCurrency = (amount) => `₹${amount?.toFixed(2) || 0}`;

    const getStatusColor = (status) => {
        const colors = {
            'NEW': 'var(--primary)',
            'PROCESSING': '#F59E0B',
            'COMPLETED': '#059669',
            'CANCELLED': '#EF4444'
        };
        return colors[status] || '#6B7280';
    };

    const getOrderTypeIcon = (type) => type === 'DELIVERY' ? '🚚' : '📦';

    // Count orders by status
    const statusCounts = {
        ALL: orders.length,
        NEW: orders.filter(o => o.status === 'NEW').length,
        PROCESSING: orders.filter(o => o.status === 'PROCESSING').length,
        COMPLETED: orders.filter(o => o.status === 'COMPLETED').length,
        CANCELLED: orders.filter(o => o.status === 'CANCELLED').length
    };

    if (authLoading || loading) {
        return (
            <div className="admin-orders-page">
                <div className="admin-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-orders-page">
                <div className="admin-container">
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-orders-page">
            <div className="admin-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">📦 Orders Management</h1>
                        <p className="page-subtitle">
                            Real-time order tracking • {statusCounts.ALL} total orders
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by order ID, customer name, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="clear-search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Status Filter Tabs */}
                <div className="filter-tabs">
                    {['ALL', 'NEW', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map(status => (
                        <button
                            key={status}
                            className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status} ({statusCounts[status]})
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No orders found</h3>
                        <p>
                            {searchTerm
                                ? 'Try adjusting your search or filters'
                                : statusFilter !== 'ALL'
                                    ? `No ${statusFilter.toLowerCase()} orders yet`
                                    : 'Orders will appear here when customers place them'
                            }
                        </p>
                        {(searchTerm || statusFilter !== 'ALL') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('ALL');
                                }}
                                className="btn-secondary"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="orders-grid">
                        {filteredOrders.map(order => {
                            const isNew = order.createdAt &&
                                (new Date() - (order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt))) < 300000; // 5 mins

                            return (
                                <div
                                    key={order.id}
                                    className={`order-card ${isNew ? 'new-order' : ''}`}
                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                >
                                    {isNew && <div className="new-badge">NEW</div>}

                                    <div className="order-card-header">
                                        <div className="order-id">
                                            {getOrderTypeIcon(order.order_type)} #{order.id.slice(-6)}
                                        </div>
                                        <div
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(order.status) }}
                                        >
                                            {order.status}
                                        </div>
                                    </div>

                                    <div className="order-card-body">
                                        <div className="info-row">
                                            <span className="label">Customer:</span>
                                            <span className="value">{order.customer_name}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Phone:</span>
                                            <span className="value">{order.customer_phone}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Items:</span>
                                            <span className="value">{order.items?.length || 0} items</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Total:</span>
                                            <span className="value total">{formatCurrency(order.total)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Date:</span>
                                            <span className="value">{formatDate(order.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="order-card-footer">
                                        <button className="btn-view">View Details →</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminOrdersList;
