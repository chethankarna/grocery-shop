import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, clearCart } from '../services/cartService'
import { submitOrder, createOrderObject, calculateTotals, DELIVERY_FEE } from '../services/orderService'
import { placeOrder as placeFirestoreOrder } from '../services/ordersService'
import { useAuth } from '../context/AuthContext'
import { generateCheckoutMessage } from '../utils/whatsapp'
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
                    console.log('Order placed in Firestore:', orderId)
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

            const result = await submitOrder(order)

            if (result.success || orderId) {
                setSubmittedOrder({ ...order, order_id: orderId || order.order_id })
                setStep('success')
                clearCart()
            } else {
                setError('Failed to submit order. Please try again or contact us via WhatsApp.')
            }
        } catch (err) {
            console.error('Order submission error:', err)
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleWhatsAppNotify = () => {
        const whatsappUrl = generateCheckoutMessage(submittedOrder)
        window.open(whatsappUrl, '_blank')
    }

    if (step === 'success') {
        return (
            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="success-screen">
                        <div className="success-icon">✓</div>
                        <h1 className="success-title">Order Placed!</h1>
                        <p className="success-message">
                            Your order has been received. We'll prepare it and notify you shortly.
                        </p>
                        <div className="order-id">
                            Order ID: {submittedOrder?.order_id}
                        </div>

                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleWhatsAppNotify(); }}
                            className="whatsapp-button"
                        >
                            <span>📱</span>
                            <span>Notify on WhatsApp</span>
                        </a>

                        <button
                            onClick={() => navigate('/')}
                            className="back-button"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Order Summary */}
                <div className="checkout-header">
                    <h2 className="order-summary-title">Your Order ({cart.length} items)</h2>
                    <div className="order-summary-row">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {orderType === 'DELIVERY' && (
                        <div className="order-summary-row">
                            <span>Delivery Fee</span>
                            <span>{formatCurrency(deliveryFee)}</span>
                        </div>
                    )}
                    <div className="order-summary-total">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {step === 'select' && (
                    <div className="checkout-options">
                        <div
                            className={`checkout-option ${orderType === 'PICKUP' ? 'selected' : ''}`}
                            onClick={() => handleSelectOption('PICKUP')}
                        >
                            <div className="option-icon">📦</div>
                            <h3 className="option-title">Pickup by Time</h3>
                            <p className="option-description">
                                Choose a convenient time to pick up your order from our store
                            </p>
                        </div>

                        <div
                            className={`checkout-option ${orderType === 'DELIVERY' ? 'selected' : ''}`}
                            onClick={() => handleSelectOption('DELIVERY')}
                        >
                            <div className="option-icon">🏠</div>
                            <h3 className="option-title">Home Delivery</h3>
                            <p className="option-description">
                                Get your order delivered to your doorstep (₹{DELIVERY_FEE} delivery fee)
                            </p>
                        </div>
                    </div>
                )}

                {step === 'pickup' && (
                    <>
                        <button onClick={handleBack} className="back-button">
                            ← Change Option
                        </button>

                        <div className="checkout-form">
                            <h3 className="option-title" style={{ marginBottom: '1.5rem' }}>
                                📦 Pickup Details
                            </h3>

                            <div className="form-group">
                                <label className="form-label">Your Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Pickup Date *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Pickup Time * (at least {PREP_TIME_MINUTES} min from now)</label>
                                <div className="time-slots">
                                    {getAvailableTimeSlots().map(slot => (
                                        <button
                                            key={slot.value}
                                            className={`time-slot ${pickupTime === slot.value ? 'selected' : ''}`}
                                            onClick={() => setPickupTime(slot.value)}
                                            disabled={slot.disabled}
                                        >
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Special Instructions (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special requests?"
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="submit-button"
                            >
                                {loading ? 'Placing Order...' : `Confirm Pickup - ${formatCurrency(total)}`}
                            </button>
                        </div>
                    </>
                )}

                {step === 'delivery' && (
                    <>
                        <button onClick={handleBack} className="back-button">
                            ← Change Option
                        </button>

                        <div className="checkout-form">
                            <h3 className="option-title" style={{ marginBottom: '1.5rem' }}>
                                🏠 Delivery Details
                            </h3>

                            <div className="form-group">
                                <label className="form-label">Your Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Delivery Address *</label>
                                <textarea
                                    className="form-textarea"
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    placeholder="House/Flat no, Street, Landmark, Area, City, PIN"
                                />
                            </div>

                            <div className="delivery-fee-info">
                                <div className="delivery-fee-icon">🚚</div>
                                <div className="delivery-fee-text">
                                    Delivery fee of {formatCurrency(DELIVERY_FEE)} will be added to your order
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Special Instructions (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special requests?"
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="submit-button"
                            >
                                {loading ? 'Placing Order...' : `Confirm Delivery - ${formatCurrency(total)}`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Checkout
