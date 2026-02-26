import { useState, useEffect } from 'react'
import './QuantitySelector.css'

function QuantitySelector({
    initialQuantity = 1,
    min = 0,
    max = 99,
    onChange,
    disabled = false
}) {
    const [quantity, setQuantity] = useState(initialQuantity)

    useEffect(() => {
        setQuantity(initialQuantity)
    }, [initialQuantity])

    const handleDecrease = () => {
        if (disabled) return

        const newQuantity = quantity - 1

        if (newQuantity >= min) {
            setQuantity(newQuantity)
            onChange?.(newQuantity)
        }
    }

    const handleIncrease = () => {
        if (disabled) return

        if (quantity < max) {
            const newQuantity = quantity + 1
            setQuantity(newQuantity)
            onChange?.(newQuantity)
        }
    }

    const handleInputChange = (e) => {
        if (disabled) return

        const value = parseInt(e.target.value)

        if (isNaN(value)) {
            setQuantity(min)
            onChange?.(min)
            return
        }

        const newQuantity = Math.min(Math.max(value, min), max)
        setQuantity(newQuantity)
        onChange?.(newQuantity)
    }

    return (
        <div className="quantity-selector">
            <button
                onClick={handleDecrease}
                disabled={disabled}
                className="quantity-btn"
                aria-label="Decrease quantity"
            >
                −
            </button>

            <input
                type="number"
                min={min}
                max={max}
                value={quantity}
                onChange={handleInputChange}
                disabled={disabled}
                className="quantity-input"
                aria-label="Quantity"
            />

            <button
                onClick={handleIncrease}
                disabled={disabled || quantity >= max}
                className="quantity-btn"
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>
    )
}

export default QuantitySelector