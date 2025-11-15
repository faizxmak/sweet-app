import { useState } from 'react'
import { type Sweet } from '../context/SweetContextValue'
import { useSweets } from '../context/useSweets'
import '../styles/SweetCard.css'

interface SweetCardProps {
  sweet: Sweet
  onPurchase: () => void
}

export default function SweetCard({ sweet, onPurchase }: SweetCardProps) {
  const { updateSweet } = useSweets()
  const [quantity, setQuantity] = useState(1)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(value, sweet.quantity))
    setQuantity(newQuantity)
  }

  const handlePurchase = async () => {
    if (sweet.quantity <= 0 || quantity <= 0) return

    setIsPurchasing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Update inventory
    updateSweet(sweet.id, { quantity: sweet.quantity - quantity })
    
    setShowSuccess(true)
    onPurchase()
    
    setTimeout(() => {
      setShowSuccess(false)
      setQuantity(1)
    }, 2000)

    setIsPurchasing(false)
  }

  const isPurchaseDisabled = sweet.quantity === 0 || quantity === 0

  return (
    <div className="sweet-card">
      {showSuccess && <div className="success-notification">✓ Order placed!</div>}
      
      <div className="sweet-image-container">
        <div className="sweet-image">{sweet.image}</div>
        {sweet.quantity === 0 && <div className="out-of-stock">Out of Stock</div>}
        <span className="quantity-badge">{sweet.quantity} left</span>
      </div>

      <div className="sweet-content">
        <h3 className="sweet-name">{sweet.name}</h3>
        <p className="sweet-description">{sweet.description}</p>
        
        <div className="sweet-category">
          <span className="category-tag">{sweet.category}</span>
        </div>

        <div className="sweet-footer">
          <span className="sweet-price">₹{sweet.price}</span>
        </div>

        {sweet.quantity > 0 && (
          <div className="purchase-section">
            <div className="quantity-selector">
              <button
                className="qty-btn"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isPurchasing}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={sweet.quantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="qty-input"
                disabled={isPurchasing}
              />
              <button
                className="qty-btn"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= sweet.quantity || isPurchasing}
              >
                +
              </button>
            </div>

            <button
              className="purchase-button"
              onClick={handlePurchase}
              disabled={isPurchaseDisabled || isPurchasing}
            >
              {isPurchasing ? '⏳ Ordering...' : '🛒 Purchase'}
            </button>
          </div>
        )}

        {sweet.quantity === 0 && (
          <button className="purchase-button disabled-btn" disabled>
            ✕ Out of Stock
          </button>
        )}

        <div className="price-breakdown">
          <small>Total: ₹{sweet.price * quantity}</small>
        </div>
      </div>
    </div>
  )
}
