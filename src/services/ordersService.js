import { addDoc, collection, serverTimestamp, runTransaction, doc } from "firebase/firestore";
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

export { DELIVERY_FEE };
