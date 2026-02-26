import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, clearCart } from '../services/cartService'
import { submitOrder, createOrderObject, calculateTotals, DELIVERY_FEE } from '../services/orderService'
import { placeOrder as placeFirestoreOrder } from '../services/ordersService'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/currency'
import './Checkout.css'

const PREP_TIME_MINUTES = parseInt(import.meta.env.VITE_PREP_TIME_MINUTES || '30')
const SHOP_OPEN_HOUR = parseInt(import.meta.env.VITE_SHOP_OPEN_HOUR || '9')
const SHOP_CLOSE_HOUR = parseInt(import.meta.env.VITE_SHOP_CLOSE_HOUR || '21')

function Checkout() {
    const navigate = useNavigate()
    const { user, isCompleteUser } = useAuth()
    const [cart, setCart] = useState([])
    const [step, setStep] = useState('select') // 'select', 'pickup', 'delivery', 'success'
    const [orderType, setOrderType] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [submittedOrder, setSubmittedOrder] = useState(null)

    // Form data
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [pickupDate, setPickupDate] = useState('')
    const [pickupTime, setPickupTime] = useState('')
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        const cartItems = getCart()
        if (cartItems.length === 0) {
            navigate('/cart')
        }
        setCart(cartItems)

        // Set default pickup date to today
        const today = new Date().toISOString().split('T')[0]
        setPickupDate(today)
    }, [navigate])

    const { subtotal, deliveryFee, total } = calculateTotals(cart, orderType)

    const handleSelectOption = (type) => {
        // Check auth before proceeding
        if (!isCompleteUser()) {
            // Save order type and redirect to login
            navigate('/login', {
                state: {
                    next: '/checkout',
                    intent: 'PLACE_ORDER',
                    orderType: type
                }
            })
            return
        }

        setOrderType(type)
        setStep(type === 'PICKUP' ? 'pickup' : 'delivery')
    }

    const handleBack = () => {
        if (step === 'pickup' || step === 'delivery') {
            setStep('select')
            setOrderType(null)
        } else {
            navigate('/cart')
        }
    }

    const getAvailableTimeSlots = () => {
        const slots = []
        const now = new Date()
        const selectedDate = new Date(pickupDate)
        const isToday = selectedDate.toDateString() === now.toDateString()

        for (let hour = SHOP_OPEN_HOUR; hour < SHOP_CLOSE_HOUR; hour++) {
            for (let minute of [0, 30]) {
                const slotTime = new Date(selectedDate)
                slotTime.setHours(hour, minute, 0, 0)

                // Check if slot is at least PREP_TIME_MINUTES from now
                const minTime = new Date(now.getTime() + PREP_TIME_MINUTES * 60000)

                if (!isToday || slotTime >= minTime) {
                    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                    slots.push({
                        value: timeStr,
                        label: slotTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        disabled: false
                    })
                }
            }
        }

        return slots
    }

    const validateForm = () => {
        if (!customerName.trim()) {
            setError('Please enter your name')
            return false
        }

        if (!customerPhone.trim() || customerPhone.length < 10) {
            setError('Please enter a valid 10-digit phone number')
            return false
        }

        if (orderType === 'PICKUP') {
            if (!pickupDate || !pickupTime) {
                setError('Please select pickup date and time')
                return false
            }
        } else {
            if (!deliveryAddress.trim()) {
                setError('Please enter your delivery address')
                return false
            }
        }

        setError(null)
        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setLoading(true)
        setError(null)

        try {
            const customerDetails = {
                name: customerName,
                phone: customerPhone,
                notes: notes,
            }

            if (orderType === 'PICKUP') {
                const pickupDatetime = new Date(`${pickupDate}T${pickupTime}:00`)
                customerDetails.pickupDatetime = pickupDatetime.toISOString()
            } else {
                customerDetails.deliveryAddress = deliveryAddress
            }

            let orderId;

            // Try to place order in Firestore if user is authenticated
            if (isCompleteUser()) {
                try {
                    orderId = await placeFirestoreOrder(orderType, cart, user, customerDetails)
                    console.log('✅ Order placed in Firestore:', orderId)

                    // Clear cart immediately after successful Firestore order
                    clearCart()

                    // Set success state
                    const order = createOrderObject(cart, orderType, customerDetails)
                    order.firestore_id = orderId
                    setSubmittedOrder({ ...order, order_id: orderId })
                    setStep('success')

                } catch (firestoreError) {
                    console.error('Firestore order failed:', firestoreError)
                    setError(firestoreError.message)
                    setLoading(false)
                    return
                }
            }

            // Also submit to Google Sheets for backup/notification
            const order = createOrderObject(cart, orderType, customerDetails)
            if (orderId) {
                order.firestore_id = orderId
            }

            try {
                const result = await submitOrder(order)
                console.log('📧 Order notification sent to Google Sheets')
            } catch (sheetsError) {
                // Google Sheets is just for notifications, so don't fail the order
                console.warn('Google Sheets notification failed (non-critical):', sheetsError)
            }

        } catch (err) {
            console.error('Order submission error:', err)
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleWhatsApp = () => {
        const phoneNumber = '919876543210'; // Replace with your WhatsApp number
        let message = `Hello, I just placed an order. My Order ID is ${submittedOrder?.order_id}.`;
        if (submittedOrder?.order_type === 'PICKUP') {
            message += ` I will pick it up on ${new Date(submittedOrder.pickupDatetime).toLocaleDateString()} at ${new Date(submittedOrder.pickupDatetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`;
        } else if (submittedOrder?.order_type === 'DELIVERY') {
            message += ` My delivery address is ${submittedOrder.deliveryAddress}.`;
        }
        message += ` Total amount: ${formatCurrency(submittedOrder?.total)}.`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container container">
                {step === 'success' && submittedOrder ? (
                    <div className="success-view animate-fade-in-up">
                        <div className="success-card card text-center">
                            <div className="success-icon-wrapper">
                                <div className="success-icon">✓</div>
                            </div>
                            <h2 className="success-title">Order Placed Successfully!</h2>

                            <div className="order-receipt card shadow-none bg-muted mb-xl">
                                <div className="receipt-row">
                                    <span className="receipt-label">Order Type</span>
                                    <span className="receipt-value">
                                        {submittedOrder.order_type === 'PICKUP' ? 'Pickup' : 'Home Delivery'}
                                    </span>
                                </div>
                                <div className="receipt-row">
                                    <span className="receipt-label">Total Amount</span>
                                    <span className="receipt-value text-accent-teal">{formatCurrency(submittedOrder.total)}</span>
                                </div>
                                {submittedOrder.order_id && (
                                    <div className="receipt-row">
                                        <span className="receipt-label">Order ID</span>
                                        <span className="receipt-value font-mono">{submittedOrder.order_id}</span>
                                    </div>
                                )}
                                <p className="receipt-note text-small mt-sm">
                                    We'll contact you shortly to confirm your order details.
                                </p>
                            </div>

                            <div className="success-actions">
                                <button
                                    onClick={() => navigate('/')}
                                    className="btn btn--secondary w-full"
                                >
                                    Continue Shopping
                                </button>
                                <button
                                    onClick={handleWhatsApp}
                                    className="btn btn--success w-full mt-sm"
                                >
                                    <span className="mr-xs">💬</span> Contact on WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Order Progress & Summary Header */}
                        <div className="checkout-summary-header card mb-xl">
                            <div className="summary-header-row mb-md">
                                <h2 className="summary-title">Order Summary ({cart.length} items)</h2>
                                <button onClick={() => navigate('/cart')} className="btn-link text-small">Edit Cart</button>
                            </div>

                            <div className="summary-details">
                                <div className="summary-row">
                                    <span className="summary-label">Subtotal</span>
                                    <span className="summary-value">{formatCurrency(subtotal)}</span>
                                </div>
                                {orderType === 'DELIVERY' && (
                                    <div className="summary-row">
                                        <span className="summary-label">Delivery Fee</span>
                                        <span className="summary-value">{formatCurrency(deliveryFee)}</span>
                                    </div>
                                )}
                                <div className="summary-row total-row pt-sm mt-sm">
                                    <span className="summary-label text-bold">Total</span>
                                    <span className="summary-value text-accent-teal text-h2">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert--danger mb-xl">
                                <span className="alert-icon">⚠️</span>
                                <span className="alert-message">{error}</span>
                            </div>
                        )}

                        {step === 'select' && (
                            <div className="checkout-step step-select animate-fade-in-up">
                                <h3 className="step-title mb-lg">Choose How to Receive Your Order</h3>
                                <div className="options-grid">
                                    <div
                                        className={`option-card card clickable ${orderType === 'PICKUP' ? 'is-selected' : ''}`}
                                        onClick={() => handleSelectOption('PICKUP')}
                                    >
                                        <div className="option-visual">📦</div>
                                        <div className="option-content">
                                            <h4 className="option-name">Store Pickup</h4>
                                            <p className="option-desc">Choose a convenient time to collect from store</p>
                                        </div>
                                        <div className="option-badge text-accent-teal">FREE</div>
                                    </div>

                                    <div
                                        className={`option-card card clickable ${orderType === 'DELIVERY' ? 'is-selected' : ''}`}
                                        onClick={() => handleSelectOption('DELIVERY')}
                                    >
                                        <div className="option-visual">🏠</div>
                                        <div className="option-content">
                                            <h4 className="option-name">Home Delivery</h4>
                                            <p className="option-desc">Delivered to your doorstep</p>
                                        </div>
                                        <div className="option-badge">{formatCurrency(DELIVERY_FEE)}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(step === 'pickup' || step === 'delivery') && (
                            <div className="checkout-step step-details animate-fade-in-up">
                                <div className="step-header mb-lg">
                                    <button onClick={handleBack} className="btn-back mb-sm">
                                        ← Back to options
                                    </button>
                                    <h3 className="step-title">
                                        {step === 'pickup' ? '📦 Pickup Details' : '🏠 Delivery Details'}
                                    </h3>
                                </div>

                                <div className="checkout-form card">
                                    <div className="form-section">
                                        <h4 className="section-subtitle mb-md">Personal Information</h4>
                                        <div className="form-group mb-md">
                                            <label className="input-label">Your Full Name</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="e.g. Rahul Sharma"
                                                required
                                            />
                                        </div>

                                        <div className="form-group mb-md">
                                            <label className="input-label">Mobile Number</label>
                                            <input
                                                type="tel"
                                                className="input-field"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                placeholder="10-digit mobile number"
                                                maxLength={10}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <hr className="divider mb-lg" />

                                    {step === 'pickup' ? (
                                        <div className="form-section">
                                            <h4 className="section-subtitle mb-md">Scheduling</h4>
                                            <div className="form-group mb-md">
                                                <label className="input-label">Pickup Date</label>
                                                <input
                                                    type="date"
                                                    className="input-field"
                                                    value={pickupDate}
                                                    onChange={(e) => setPickupDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="input-label mb-xs d-block">Available Time Slots</label>
                                                <p className="text-tiny text-tertiary mb-sm">Earliest available after {PREP_TIME_MINUTES} mins preparation</p>
                                                <div className="time-slots-grid">
                                                    {getAvailableTimeSlots().map(slot => (
                                                        <button
                                                            key={slot.value}
                                                            className={`slot-chip ${pickupTime === slot.value ? 'is-active' : ''}`}
                                                            onClick={() => setPickupTime(slot.value)}
                                                            disabled={slot.disabled}
                                                        >
                                                            {slot.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="form-section">
                                            <h4 className="section-subtitle mb-md">Delivery Address</h4>
                                            <div className="form-group mb-md">
                                                <label className="input-label">Full Address</label>
                                                <textarea
                                                    className="textarea-field"
                                                    value={deliveryAddress}
                                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                                    placeholder="House/Flat no, Street, Area, Landmark"
                                                    required
                                                />
                                            </div>
                                            <div className="info-banner bg-muted p-sm rounded-sm mb-md">
                                                <span className="mr-xs">🚚</span>
                                                <span className="text-small text-secondary">A delivery fee of {formatCurrency(DELIVERY_FEE)} is included.</span>
                                            </div>
                                        </div>
                                    )}

                                    <hr className="divider mb-lg" />

                                    <div className="form-section">
                                        <div className="form-group mb-xl">
                                            <label className="input-label">Special Instructions (Optional)</label>
                                            <textarea
                                                className="textarea-field"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Any landmarks or delivery instructions?"
                                            />
                                        </div>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className={`btn btn--primary btn--large w-full ${loading ? 'is-loading' : ''}`}
                                        >
                                            {loading ? 'Processing Order...' : `Confirm & Place Order • ${formatCurrency(total)}`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Checkout
