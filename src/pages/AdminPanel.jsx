// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { getAllOrders, updateOrderStatus } from '../services/ordersService';
// import { useNavigate } from 'react-router-dom';
// import './AdminPanel.css';

// function AdminPanel() {
//     const { user, isAdmin } = useAuth();
//     const navigate = useNavigate();
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [filter, setFilter] = useState('all'); // all, NEW, PROCESSING, COMPLETED

//     useEffect(() => {
//         if (!user || !isAdmin) {
//             navigate('/');
//             return;
//         }
//         loadOrders();
//     }, [user, isAdmin, navigate, filter]);

//     async function loadOrders() {
//         setLoading(true);
//         setError(null);
//         try {
//             const statusFilter = filter === 'all' ? null : filter;
//             const fetchedOrders = await getAllOrders(100, statusFilter);
//             setOrders(fetchedOrders);
//         } catch (err) {
//             console.error('Error loading orders:', err);
//             setError('Failed to load orders. Please check Firestore security rules.');
//         } finally {
//             setLoading(false);
//         }
//     }

//     async function handleStatusChange(orderId, newStatus) {
//         try {
//             await updateOrderStatus(orderId, newStatus);
//             // Reload orders
//             await loadOrders();
//         } catch (err) {
//             console.error('Error updating status:', err);
//             alert('Failed to update order status');
//         }
//     }

//     function formatDate(timestamp) {
//         if (!timestamp) return 'N/A';
//         const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//         return date.toLocaleString('en-IN', {
//             dateStyle: 'medium',
//             timeStyle: 'short'
//         });
//     }

//     function formatCurrency(amount) {
//         return `₹${amount?.toFixed(2) || 0}`;
//     }

//     const statusColors = {
//         NEW: '#10B880',
//         PROCESSING: '#F59E0B',
//         COMPLETED: '#059669',
//         CANCELLED: '#EF4444'
//     };

//     if (loading) {
//         return (
//             <div className="admin-panel">
//                 <div className="admin-container">
//                     <div className="loading-state">Loading orders...</div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="admin-panel">
//             <div className="admin-container">
//                 <div className="admin-header">
//                     <h1 className="admin-title">Admin Panel</h1>
//                     <p className="admin-subtitle">Manage all orders</p>
//                 </div>

//                 {error && (
//                     <div className="admin-error">{error}</div>
//                 )}

//                 {/* Filter Tabs */}
//                 <div className="admin-filters">
//                     <button
//                         className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
//                         onClick={() => setFilter('all')}
//                     >
//                         All Orders ({orders.length})
//                     </button>
//                     <button
//                         className={`filter-tab ${filter === 'NEW' ? 'active' : ''}`}
//                         onClick={() => setFilter('NEW')}
//                     >
//                         New
//                     </button>
//                     <button
//                         className={`filter-tab ${filter === 'PROCESSING' ? 'active' : ''}`}
//                         onClick={() => setFilter('PROCESSING')}
//                     >
//                         Processing
//                     </button>
//                     <button
//                         className={`filter-tab ${filter === 'COMPLETED' ? 'active' : ''}`}
//                         onClick={() => setFilter('COMPLETED')}
//                     >
//                         Completed
//                     </button>
//                 </div>

//                 {/* Orders List */}
//                 <div className="orders-list">
//                     {orders.length === 0 ? (
//                         <div className="no-orders">
//                             <p>No orders found</p>
//                             {filter !== 'all' && (
//                                 <button onClick={() => setFilter('all')} className="btn-secondary">
//                                     View All Orders
//                                 </button>
//                             )}
//                         </div>
//                     ) : (
//                         orders.map(order => (
//                             <div key={order.id} className="order-card">
//                                 <div className="order-header">
//                                     <div className="order-id">
//                                         <strong>Order ID:</strong> {order.id}
//                                     </div>
//                                     <div
//                                         className="order-status"
//                                         style={{ backgroundColor: statusColors[order.status] }}
//                                     >
//                                         {order.status}
//                                     </div>
//                                 </div>

//                                 <div className="order-details">
//                                     <div className="detail-row">
//                                         <span className="detail-label">Customer:</span>
//                                         <span className="detail-value">{order.customer_name}</span>
//                                     </div>
//                                     <div className="detail-row">
//                                         <span className="detail-label">Phone:</span>
//                                         <span className="detail-value">{order.customer_phone}</span>
//                                     </div>
//                                     <div className="detail-row">
//                                         <span className="detail-label">Type:</span>
//                                         <span className="detail-value">
//                                             {order.order_type === 'PICKUP' ? '📦 Pickup' : '🚚 Delivery'}
//                                         </span>
//                                     </div>
//                                     {order.order_type === 'DELIVERY' && order.delivery_address && (
//                                         <div className="detail-row">
//                                             <span className="detail-label">Address:</span>
//                                             <span className="detail-value">{order.delivery_address}</span>
//                                         </div>
//                                     )}
//                                     {order.order_type === 'PICKUP' && order.pickup_datetime && (
//                                         <div className="detail-row">
//                                             <span className="detail-label">Pickup Time:</span>
//                                             <span className="detail-value">
//                                                 {new Date(order.pickup_datetime).toLocaleString('en-IN')}
//                                             </span>
//                                         </div>
//                                     )}
//                                     <div className="detail-row">
//                                         <span className="detail-label">Date:</span>
//                                         <span className="detail-value">{formatDate(order.createdAt)}</span>
//                                     </div>
//                                 </div>

//                                 {/* Order Items */}
//                                 <div className="order-items">
//                                     <h4>Items:</h4>
//                                     {order.items?.map((item, idx) => (
//                                         <div key={idx} className="order-item">
//                                             <span>{item.name} x {item.qty}</span>
//                                             <span>{formatCurrency(item.lineTotal)}</span>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {/* Order Total */}
//                                 <div className="order-total">
//                                     <div className="total-row">
//                                         <span>Subtotal:</span>
//                                         <span>{formatCurrency(order.subtotal)}</span>
//                                     </div>
//                                     {order.delivery_fee > 0 && (
//                                         <div className="total-row">
//                                             <span>Delivery Fee:</span>
//                                             <span>{formatCurrency(order.delivery_fee)}</span>
//                                         </div>
//                                     )}
//                                     <div className="total-row final">
//                                         <strong>Total:</strong>
//                                         <strong>{formatCurrency(order.total)}</strong>
//                                     </div>
//                                 </div>

//                                 {/* Status Actions */}
//                                 <div className="order-actions">
//                                     <label>Update Status:</label>
//                                     <select
//                                         value={order.status}
//                                         onChange={(e) => handleStatusChange(order.id, e.target.value)}
//                                         className="status-select"
//                                     >
//                                         <option value="NEW">New</option>
//                                         <option value="PROCESSING">Processing</option>
//                                         <option value="COMPLETED">Completed</option>
//                                         <option value="CANCELLED">Cancelled</option>
//                                     </select>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default AdminPanel;



// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { listenAdminOrdersRealtime, updateOrderStatus } from '../services/ordersService';
// import { useNavigate } from 'react-router-dom';
// import './AdminPanel.css';

// function AdminPanel() {
//     const { user, isAdmin } = useAuth();
//     const navigate = useNavigate();
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [filter, setFilter] = useState('all');
//     const [updatingId, setUpdatingId] = useState(null);

//     const statusColors = {
//         NEW: '#10B880',
//         PROCESSING: '#F59E0B',
//         COMPLETED: '#059669',
//         CANCELLED: '#EF4444'
//     };

//     useEffect(() => {
//         if (!user || !isAdmin) {
//             navigate('/');
//             return;
//         }

//         const statusFilter = filter === 'all' ? null : filter;
//         const unsubscribe = listenAdminOrdersRealtime(
//             (fetchedOrders) => {
//                 setOrders(fetchedOrders);
//                 setLoading(false);
//             },
//             (err) => {
//                 console.error('Error loading orders:', err);
//                 setError('Failed to load orders.');
//                 setLoading(false);
//             },
//             statusFilter
//         );

//         return () => unsubscribe();
//     }, [user, isAdmin, navigate, filter]);

//     async function handleStatusChange(orderId, newStatus) {
//         setUpdatingId(orderId);
//         try {
//             await updateOrderStatus(orderId, newStatus);
//         } catch (err) {
//             console.error('Error updating status:', err);
//             alert('Failed to update order status');
//         } finally {
//             setUpdatingId(null);
//         }
//     }

//     function formatDate(timestamp) {
//         if (!timestamp) return 'N/A';
//         const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//         return date.toLocaleString('en-IN', {
//             dateStyle: 'medium',
//             timeStyle: 'short'
//         });
//     }

//     function formatCurrency(amount) {
//         return `₹${amount?.toFixed(2) || 0}`;
//     }

//     if (loading) {
//         return (
//             <div className="admin-panel">
//                 <div className="admin-container">
//                     <div className="loading-state">Loading orders...</div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="admin-panel">
//             <div className="admin-container">
//                 <div className="admin-header">
//                     <h1 className="admin-title">Admin Panel</h1>
//                     <p className="admin-subtitle">Manage all orders</p>
//                 </div>

//                 {error && (
//                     <div className="admin-error">{error}</div>
//                 )}

//                 <div className="admin-filters">
//                     <button
//                         className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
//                         onClick={() => setFilter('all')}
//                     >
//                         All Orders ({orders.length})
//                     </button>
//                     <button
//                         className={`filter-tab ${filter === 'NEW' ? 'active' : ''}`}
//                         onClick={() => setFilter('NEW')}
//                     >
//                         New
//                     </button>
//                     <button
//                         className={`filter-tab ${filter === 'PROCESSING' ? 'active' : ''}`}
//                         onClick={() => setFilter('PROCESSING')}
//                     >
//                         Processing
//                     </button>
//                     <button
//                         className={`filter-tab ${filter === 'COMPLETED' ? 'active' : ''}`}
//                         onClick={() => setFilter('COMPLETED')}
//                     >
//                         Completed
//                     </button>
//                 </div>

//                 <div className="orders-list">
//                     {orders.length === 0 ? (
//                         <div className="no-orders">
//                             <p>No orders found</p>
//                             {filter !== 'all' && (
//                                 <button onClick={() => setFilter('all')} className="btn-secondary">
//                                     View All Orders
//                                 </button>
//                             )}
//                         </div>
//                     ) : (
//                         orders.map(order => (
//                             <div key={order.id} className="order-card">
//                                 <div className="order-top">
//                                     <span className="order-id">#{order.id}</span>
//                                     <span
//                                         className="order-status"
//                                         style={{ background: statusColors[order.status] }}
//                                     >
//                                         {order.status}
//                                     </span>
//                                 </div>

//                                 <div className="order-info">
//                                     <div><strong>Customer:</strong> {order.customer_name}</div>
//                                     <div><strong>Phone:</strong> {order.customer_phone}</div>
//                                     <div><strong>Date:</strong> {formatDate(order.createdAt)}</div>
//                                 </div>

//                                 <div className="order-items">
//                                     {order.items?.map((item, i) => (
//                                         <div key={i} className="item-row">
//                                             <span>{item.name} × {item.qty}</span>
//                                             <span>{formatCurrency(item.lineTotal)}</span>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 <div className="order-total">
//                                     <strong>Total</strong>
//                                     <strong>{formatCurrency(order.total)}</strong>
//                                 </div>

//                                 <div className="order-actions">
//                                     <select
//                                         disabled={updatingId === order.id}
//                                         value={order.status}
//                                         onChange={(e) => handleStatusChange(order.id, e.target.value)}
//                                     >
//                                         <option value="NEW">New</option>
//                                         <option value="PROCESSING">Processing</option>
//                                         <option value="COMPLETED">Completed</option>
//                                         <option value="CANCELLED">Cancelled</option>
//                                     </select>

//                                     {updatingId === order.id && <span className="saving">Saving...</span>}
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default AdminPanel;



import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listenAdminOrdersRealtime, updateOrderStatus } from '../services/ordersService';
import {
    listenProductsRealtime,
    addProduct,
    updateProduct,
    deleteProduct
} from '../services/productsService';
import { useNavigate } from 'react-router-dom';
import ProductFormModal from '../components/ProductFormModal';
import ProductRow from '../components/ProductRow';
import OrderDetailsModal from '../components/OrderDetailsModal';
import './AdminPanel.css';

function AdminPanel() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState('orders'); // 'orders' or 'inventory'
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
                ) : (
                    <InventoryManager />
                )}
            </main>
        </div>
    );
}

function InventoryManager() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [categories, setCategories] = useState([])


    useEffect(() => {
        // Listen to products in real-time
        const unsubscribe = listenProductsRealtime(
            (fetchedProducts) => {
                setProducts(fetchedProducts)

                // Extract unique categories
                const cats = [...new Set(fetchedProducts.map(p => p.category))]
                setCategories(cats.sort())

                setLoading(false)
            },
            (error) => {
                console.error('Error loading products:', error)
                setLoading(false)
            }
        )

        return () => unsubscribe()
    }, [])

    const handleAddProduct = () => {
        setEditingProduct(null)
        setIsModalOpen(true)
    }

    const handleEditProduct = (product) => {
        setEditingProduct(product)
        setIsModalOpen(true)
    }

    const handleDeleteProduct = async (productId, imageUrl) => {
        try {
            await deleteProduct(productId, imageUrl)
            // Success feedback
            console.log('Product deleted successfully')
        } catch (error) {
            alert('Failed to delete product: ' + error.message)
        }
    }

    const handleSubmitProduct = async (productData) => {
        try {
            if (editingProduct) {
                // Update existing product
                await updateProduct(editingProduct.id, productData)
            } else {
                // Add new product
                await addProduct(productData)
            }
        } catch (error) {
            throw error // Let modal handle the error
        }
    }

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    if (loading) {
        return (
            <div className="section-container">
                <div className="loading-state">Loading products...</div>
            </div>
        )
    }

    return (
        <>
            <div className="section-container">
                <header className="section-header">
                    <h2>Product Inventory</h2>
                    <button className="btn-add" onClick={handleAddProduct}>
                        + Add New Product
                    </button>
                </header>

                <div className="inventory-controls">
                    <input
                        type="text"
                        placeholder="🔍 Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="category-filter"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <p>No products found</p>
                        {searchTerm || categoryFilter !== 'all' ? (
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setSearchTerm('')
                                    setCategoryFilter('all')
                                }}
                            >
                                Clear Filters
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={handleAddProduct}>
                                Add Your First Product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Visibility</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <ProductRow
                                        key={product.id}
                                        product={product}
                                        onEdit={handleEditProduct}
                                        onDelete={handleDeleteProduct}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="inventory-stats">
                    <div className="stat">
                        <span className="stat-label">Total Products</span>
                        <span className="stat-value">{products.length}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Low Stock</span>
                        <span className="stat-value warning">
                            {products.filter(p => p.stock < 10).length}
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Out of Stock</span>
                        <span className="stat-value danger">
                            {products.filter(p => p.stock === 0).length}
                        </span>
                    </div>
                </div>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitProduct}
                product={editingProduct}
                categories={categories}
            />
        </>
    )
}

export default AdminPanel;