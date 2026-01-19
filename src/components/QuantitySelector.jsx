import { useState, useEffect } from 'react'

function QuantitySelector({
    initialQuantity = 1,
    min = 1,
    max = 99,
    onChange,
    disabled = false
}) {
    const [quantity, setQuantity] = useState(initialQuantity)

    useEffect(() => {
        setQuantity(initialQuantity)
    }, [initialQuantity])

    const handleDecrease = () => {
        if (quantity > min) {
            const newQuantity = quantity - 1
            setQuantity(newQuantity)
            onChange?.(newQuantity)
        }
    }

    const handleIncrease = () => {
        if (quantity < max) {
            const newQuantity = quantity + 1
            setQuantity(newQuantity)
            onChange?.(newQuantity)
        }
    }

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value) || min
        const newQuantity = Math.min(Math.max(value, min), max)
        setQuantity(newQuantity)
        onChange?.(newQuantity)
    }

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={handleDecrease}
                disabled={disabled || quantity <= min}
                className="w-11 h-11 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-50 disabled:text-neutral-400 rounded-lg font-bold text-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Decrease quantity"
                style={{ minHeight: '44px', minWidth: '44px' }}
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
                className="w-16 h-11 text-center font-semibold text-lg border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-neutral-50"
                aria-label="Quantity"
            />

            <button
                onClick={handleIncrease}
                disabled={disabled || quantity >= max}
                className="w-11 h-11 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-50 disabled:text-neutral-400 rounded-lg font-bold text-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Increase quantity"
                style={{ minHeight: '44px', minWidth: '44px' }}
            >
                +
            </button>
        </div>
    )
}

export default QuantitySelector
