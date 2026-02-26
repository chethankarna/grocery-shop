import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listenAdminOrdersRealtime, updateOrderStatus } from '../services/ordersService';
import { useNavigate } from 'react-router-dom';
import OrderDetailsModal from '../components/OrderDetailsModal';
import ProductManager from '../components/admin/ProductManager';
import CategoryManager from '../components/admin/CategoryManager';
import './AdminPanel.css';

function AdminPanel() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState('orders'); // 'orders', 'inventory', or 'categories'
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        if (!user || !isAdmin) { navigate('/'); return; }

        const statusFilter = filter === 'all' ? null : filter;
        const unsubscribe = listenAdminOrdersRealtime(
            (fetchedOrders) => { setOrders(fetchedOrders); setLoading(false); },
            (err) => { console.error(err); setLoading(false); },
            statusFilter
        );
        return () => unsubscribe();
    }, [user, isAdmin, navigate, filter]);

    async function handleStatusChange(orderId, newStatus) {
        setUpdatingId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (err) {
            alert('Security Error: You do not have permission to update status.');
        } finally {
            setUpdatingId(null);
        }
    }

    function handleOrderClick(order) {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    }

    function closeDetailsModal() {
        setIsDetailsModalOpen(false);
        setSelectedOrder(null);
    }

    return (
        <div className="admin-layout">
            <main className="admin-main">
                {/* View Switcher at Top */}
                <div className="view-switcher">
                    <button
                        className={view === 'orders' ? 'active' : ''}
                        onClick={() => setView('orders')}
                    >
                        📦 Orders
                    </button>
                    <button
                        className={view === 'inventory' ? 'active' : ''}
                        onClick={() => setView('inventory')}
                    >
                        🍔 Inventory
                    </button>
                    <button
                        className={view === 'categories' ? 'active' : ''}
                        onClick={() => setView('categories')}
                    >
                        📁 Categories
                    </button>
                </div>

                {view === 'orders' ? (
                    <div className="section-container">
                        <header className="section-header">
                            <h2>Order Management</h2>
                            <div className="filter-pills">
                                {['all', 'NEW', 'PROCESSING', 'COMPLETED'].map(f => (
                                    <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'active' : ''}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </header>

                        <div className="orders-grid">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    className={`order-card-new ${updatingId === order.id ? 'loading' : ''}`}
                                    onClick={() => handleOrderClick(order)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="card-row">
                                        <span className="order-tag">#{order.id.slice(-5)}</span>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={`status-select-new ${order.status.toLowerCase()}`}
                                        >
                                            <option value="NEW">NEW</option>
                                            <option value="PROCESSING">PROCESSING</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
                                    </div>
                                    <div className="card-body">
                                        <h4>{order.customer_name}</h4>
                                        <p>{order.customer_phone}</p>
                                        <div className="item-summary">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="mini-item">{item.qty}x {item.name}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <span>Total: <strong>₹{order.total}</strong></span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Details Modal */}
                        <OrderDetailsModal
                            order={selectedOrder}
                            isOpen={isDetailsModalOpen}
                            onClose={closeDetailsModal}
                            onStatusChange={handleStatusChange}
                            isUpdating={updatingId === selectedOrder?.id}
                        />
                    </div>
                ) : view === 'inventory' ? (
                    <ProductManager />
                ) : (
                    <CategoryManager />
                )}
            </main>
        </div>
    );
}

export default AdminPanel;