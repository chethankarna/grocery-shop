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
                <div className="wishlist-container container">
                    <div className="wishlist-header animate-fade-in-up">
                        <h1 className="wishlist-title">Saved Items</h1>
                    </div>
                    <div className="wishlist-grid animate-fade-in-up">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="wishlist-skeleton card skeleton-shimmer"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="wishlist-page">
                <div className="wishlist-container container">
                    <div className="wishlist-empty card text-center animate-fade-in-up">
                        <div className="empty-icon text-h1 mb-lg">❤️</div>
                        <h2 className="empty-title mb-xs">No Saved Items Yet</h2>
                        <p className="empty-description text-secondary mb-xl">
                            Save products you love for easy access and quick checkout later!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn--primary btn--large"
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
            <div className="wishlist-container container">
                <div className="wishlist-header mb-xl animate-fade-in-up">
                    <h1 className="wishlist-title">
                        Saved Items ({products.length})
                    </h1>
                    <button
                        onClick={handleClearWishlist}
                        className="btn-link text-danger"
                    >
                        Remove All
                    </button>
                </div>

                <div className="wishlist-grid animate-fade-in-up">
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
