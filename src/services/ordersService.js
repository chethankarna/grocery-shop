import { addDoc, collection, serverTimestamp, runTransaction, doc, query, where, orderBy, limit as limitQuery, getDocs, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getProductPricing } from "./offersService";

const DELIVERY_FEE = parseInt(import.meta.env.VITE_DELIVERY_FEE || '30');

/**
 * Place order in Firestore with authentication check and stock management
 * @param {string} orderType - 'PICKUP' or 'DELIVERY'
 * @param {Array} cart - Cart items array
 * @param {Object} user - Firebase user object
 * @param {Object} customerDetails - Customer form data
 * @returns {Promise<string>} Order ID
 */
export async function placeOrder(orderType, cart, user, customerDetails) {
    // Validate user authentication
    if (!user || user.isAnonymous) {
        throw new Error("You must be logged in to place an order.");
    }

    // Calculate totals using current pricing
    let subtotal = 0;
    const itemsWithPricing = cart.map(item => {
        // For each cart item, we need to ensure we're calculating with current price
        const currentPrice = item.price; // Cart already has current price
        const lineTotal = currentPrice * item.quantity;
        subtotal += lineTotal;

        return {
            productId: item.id,
            name: item.name,
            image: item.image || '', // Include product image
            qty: item.quantity,
            price: currentPrice,
            lineTotal: lineTotal,
        };
    });

    const deliveryFee = orderType === 'DELIVERY' ? DELIVERY_FEE : 0;
    const total = subtotal + deliveryFee;

    // Prepare order data
    const orderData = {
        userId: user.uid,
        userEmail: user.email || 'anonymous',
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone,
        items: itemsWithPricing,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        order_type: orderType,
        status: 'NEW',
        createdAt: serverTimestamp(),
        notes: customerDetails.notes || '',
    };

    // Add pickup/delivery specific data
    if (orderType === 'PICKUP') {
        orderData.pickup_datetime = customerDetails.pickupDatetime;
    } else {
        orderData.delivery_address = customerDetails.deliveryAddress;
    }

    try {
        // Create order document first
        const ordersRef = collection(db, "orders");
        const orderDocRef = await addDoc(ordersRef, orderData);

        // Decrement stocks in transaction
        // Note: This assumes products are stored in Firestore with a 'stock' field
        // If you're using Google Sheets for products, you can skip this step
        try {
            await runTransaction(db, async (tx) => {
                for (const item of cart) {
                    const prodRef = doc(db, "products", item.id);
                    const prodSnap = await tx.get(prodRef);

                    if (prodSnap.exists()) {
                        const stock = prodSnap.data().stock || 0;
                        if (stock < item.quantity) {
                            throw new Error(`${item.name} is out of stock. Only ${stock} available.`);
                        }
                        tx.update(prodRef, { stock: stock - item.quantity });
                    }
                    // If product doesn't exist in Firestore, skip stock decrement
                    // (products might be in Google Sheets only)
                }
            });
        } catch (stockError) {
            // If stock management fails, we should ideally delete the order
            // For now, we'll just log it and continue
            console.warn('Stock decrement failed:', stockError);
            // Optionally: delete the created order or mark it as 'PENDING_STOCK_CHECK'
        }

        return orderDocRef.id;
    } catch (error) {
        console.error('Failed to place order:', error);
        throw new Error(error.message || 'Failed to place order. Please try again.');
    }
}

/**
 * Helper to check if user can place orders
 * @param {Object} user - Firebase user object
 * @returns {boolean}
 */
export function canPlaceOrder(user) {
    return user && !user.isAnonymous;
}

/**
 * Get user's order history
 * @param {string} userId - User ID
 * @param {number} limit - Number of orders to fetch (default 20)
 * @returns {Promise<Array>} Array of orders
 */
export async function getUserOrders(userId, limit = 20) {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(
            ordersRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limitQuery(limit)
        );

        const snapshot = await getDocs(q);
        const orders = [];

        snapshot.forEach(doc => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return orders;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw new Error('Failed to fetch orders');
    }
}

/**
 * Get all orders (admin only)
 * @param {number} limit - Number of orders to fetch (default 50)
 * @param {string} statusFilter - Filter by status (optional)
 * @returns {Promise<Array>} Array of all orders
 */
export async function getAllOrders(limit = 50, statusFilter = null) {
    try {
        const ordersRef = collection(db, "orders");

        let q;
        if (statusFilter) {
            q = query(
                ordersRef,
                where("status", "==", statusFilter),
                orderBy("createdAt", "desc"),
                limitQuery(limit)
            );
        } else {
            q = query(
                ordersRef,
                orderBy("createdAt", "desc"),
                limitQuery(limit)
            );
        }

        const snapshot = await getDocs(q);
        const orders = [];

        snapshot.forEach(doc => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return orders;
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw new Error('Failed to fetch orders');
    }
}

/**
 * Update order status (admin only)
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New status ('NEW', 'PROCESSING', 'COMPLETED', 'CANCELLED')
 * @returns {Promise<void>}
 */
export async function updateOrderStatus(orderId, newStatus) {
    try {
        const orderRef = doc(db, "orders", orderId);

        await updateDoc(orderRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });

        console.log(`✅ Order status updated to ${newStatus}:`, orderId);
    } catch (error) {
        console.error('Error updating order status:', error);
        throw new Error('Failed to update order status');
    }
}

/**
 * Get single order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object|null>} Order object or null
 */
export async function getOrderById(orderId) {
    try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
            return {
                id: orderSnap.id,
                ...orderSnap.data()
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw new Error('Failed to fetch order');
    }
}

/**
 * Listen to orders in realtime (admin only)
 * Uses onSnapshot for live updates
 * @param {Function} callback - Called with orders array on updates  
 * @param {Object} filters - { status, limit }
 * @returns {Function} unsubscribe function
 */
export function listenOrdersRealtime(callback, filters = {}) {
    const { status, limit = 50 } = filters;

    try {
        const ordersRef = collection(db, "orders");
        let q;

        if (status && status !== 'ALL') {
            q = query(
                ordersRef,
                where("status", "==", status),
                orderBy("createdAt", "desc"),
                limitQuery(limit)
            );
        } else {
            q = query(
                ordersRef,
                orderBy("createdAt", "desc"),
                limitQuery(limit)
            );
        }

        const unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const orders = [];
                querySnapshot.forEach((doc) => {
                    orders.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(orders);
            },
            (error) => {
                console.error("Error listening to orders:", error);
                callback([]);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error("Error setting up realtime listener:", error);
        return () => { }; // Return empty unsubscribe function
    }
}

/**
 * Listen to single order in realtime
 * @param {string} orderId - Order ID
 * @param {Function} callback - Called with order data on updates
 * @returns {Function} unsubscribe function
 */
export function listenOrderRealtime(orderId, callback) {
    try {
        const orderRef = doc(db, "orders", orderId);

        const unsubscribe = onSnapshot(orderRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    callback({
                        id: docSnapshot.id,
                        ...docSnapshot.data()
                    });
                } else {
                    callback(null);
                }
            },
            (error) => {
                console.error("Error listening to order:", error);
                callback(null);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error("Error setting up order listener:", error);
        return () => { };
    }
}

/**
 * Update admin notes for order (admin only)
 * @param {string} orderId - Order ID
 * @param {string} notes - Admin notes
 * @returns {Promise<void>}
 */
export async function updateOrderNotes(orderId, notes) {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            notes: notes || '',
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating order notes:", error);
        throw new Error("Failed to update notes");
    }
}

/**
 * Search orders by customer name, phone, or order ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching orders
 */
export async function searchOrders(searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
    }

    try {
        // Simple client-side search for now
        const allOrders = await getAllOrders(200);

        const lowercaseSearch = searchTerm.toLowerCase();
        return allOrders.filter(order =>
            order.id.toLowerCase().includes(lowercaseSearch) ||
            order.customer_name?.toLowerCase().includes(lowercaseSearch) ||
            order.customer_phone?.includes(searchTerm) ||
            order.userEmail?.toLowerCase().includes(lowercaseSearch)
        );
    } catch (error) {
        console.error("Error searching orders:", error);
        return [];
    }
}

/**
 * Validate status transition
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Proposed new status
 * @returns {boolean} Whether transition is valid
 */
export function isValidStatusTransition(currentStatus, newStatus) {
    const transitions = {
        'NEW': ['PROCESSING', 'CANCELLED'],
        'PROCESSING': ['COMPLETED', 'CANCELLED'],
        'COMPLETED': [], // Final state
        'CANCELLED': []  // Final state
    };

    return transitions[currentStatus]?.includes(newStatus) || false;
}

/**
 * Get next available statuses for current status
 * @param {string} currentStatus - Current order status
 * @returns {Array<string>} Array of valid next statuses
 */
export function getNextStatuses(currentStatus) {
    const transitions = {
        'NEW': ['PROCESSING', 'CANCELLED'],
        'PROCESSING': ['COMPLETED', 'CANCELLED'],
        'COMPLETED': [],
        'CANCELLED': []
    };

    return transitions[currentStatus] || [];
}

/**
 * Listen to user's orders in realtime (for user order history)
 * @param {string} userId - User ID
 * @param {Function} callback - Called with orders array on updates
 * @param {number} limitCount - Number of orders to fetch
 * @returns {Function} unsubscribe function
 */
export function listenUserOrdersRealtime(userId, callback, limitCount = 20) {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(
            ordersRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limitQuery(limitCount)
        );

        const unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const orders = [];
                querySnapshot.forEach((doc) => {
                    orders.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(orders);
            },
            (error) => {
                console.error("Error listening to user orders:", error);
                callback([]);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error("Error setting up user orders listener:", error);
        return () => { };
    }
}

/**
 * Listen to all orders in realtime (admin only)
 * Convenience wrapper for admin panel
 * @param {Function} onSuccess - Called with orders array on updates
 * @param {Function} onError - Called with error when listener fails
 * @param {string} statusFilter - Optional status filter
 * @returns {Function} unsubscribe function
 */
export function listenAdminOrdersRealtime(onSuccess, onError, statusFilter = null) {
    try {
        const ordersRef = collection(db, "orders");
        let q;

        if (statusFilter) {
            q = query(
                ordersRef,
                where("status", "==", statusFilter),
                orderBy("createdAt", "desc"),
                limitQuery(100)
            );
        } else {
            q = query(
                ordersRef,
                orderBy("createdAt", "desc"),
                limitQuery(100)
            );
        }

        const unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const orders = [];
                querySnapshot.forEach((doc) => {
                    orders.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                onSuccess(orders);
            },
            (error) => {
                console.error("Error listening to admin orders:", error);
                onError(error);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error("Error setting up admin orders listener:", error);
        onError(error);
        return () => { };
    }
}

export { DELIVERY_FEE };
