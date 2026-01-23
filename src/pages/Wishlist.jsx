import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { getProductById } from '../services/productsService'
import ProductCard from '../components/ProductCard'
import './Wishlist.css'

function Wishlist() {
    const navigate = useNavigate()
    const { wishlistIds, clearWishlist } = useWishlist()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadWishlistProducts = async () => {
            try {
                setLoading(true)
                if (wishlistIds.length === 0) {
                    setProducts([])
                    setLoading(false)
                    return
                }

                const productPromises = wishlistIds.map(id => getProductById(id))
                const loadedProducts = await Promise.all(productPromises)
                setProducts(loadedProducts.filter(p => p !== null))
            } catch (error) {
                console.error('Error loading wishlist products:', error)
                setProducts([])
            } finally {
                setLoading(false)
            }
        }

        loadWishlistProducts()
    }, [wishlistIds])

    const handleClearWishlist = () => {
        if (window.confirm('Remove all saved items?')) {
            clearWishlist()
        }
    }

    if (loading) {
        return (
            <div className="wishlist-page">
                <div className="wishlist-container">
                    <h1 className="wishlist-title">Saved Items</h1>
                    <div className="wishlist-grid">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="wishlist-skeleton"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="wishlist-page">
                <div className="wishlist-container">
                    <div className="wishlist-empty">
                        <div className="empty-icon">❤️</div>
                        <h2>No Saved Items Yet</h2>
                        <p>Save products you love for easy access later!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="empty-action-button"
                        >
                            Start Shopping
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="wishlist-page">
            <div className="wishlist-container">
                <div className="wishlist-header">
                    <h1 className="wishlist-title">
                        Saved Items ({products.length})
                    </h1>
                    <button
                        onClick={handleClearWishlist}
                        className="clear-wishlist-button"
                    >
                        Clear All
                    </button>
                </div>

                <div className="wishlist-grid">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            showAddButton={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Wishlist
