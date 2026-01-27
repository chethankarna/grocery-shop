import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listenUserOrdersRealtime } from '../../services/ordersService';
import OrderCard from './OrderCard';
import OrderDetailsModal from './OrderDetailsModal';
import './MyOrders.css';

function MyOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [error, setError] = useState(null);

    // Realtime listener for user's orders
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = listenUserOrdersRealtime(
            user.uid,
            (fetchedOrders) => {
                setOrders(fetchedOrders);
                setLoading(false);
            },
            20
        );

        return () => unsubscribe();
    }, [user]);

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
    };

    if (loading) {
        return (
            <div className="my-orders">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-orders">
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="my-orders">
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No orders yet</h3>
                    <p>You haven't placed any orders. Start shopping to see your order history here!</p>
                    <a href="/" className="btn-primary">
                        Start Shopping
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders">
            <div className="orders-header">
                <h2>📦 My Orders</h2>
                <p className="orders-count">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
            </div>

            <div className="orders-list">
                {orders.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onClick={handleOrderClick}
                    />
                ))}
            </div>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default MyOrders;
