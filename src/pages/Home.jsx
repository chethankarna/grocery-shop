import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import CategoryBadge from '../components/CategoryBadge'
import { fetchProducts, getCategories, searchProducts } from '../services/productsService'
import './Home.css'

function Home() {
    const [searchParams] = useSearchParams()
    const searchQuery = searchParams.get('search')

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    // Fetch products and categories on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const [productsData, categoriesData] = await Promise.all([
                    fetchProducts(),
                    getCategories()
                ])
                setProducts(productsData)
                setCategories(categoriesData)
            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    // Handle search
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery && searchQuery.trim()) {
                setIsSearching(true)
                try {
                    const results = await searchProducts(searchQuery)
                    setSearchResults(results)
                } catch (error) {
                    console.error('Error searching:', error)
                    setSearchResults([])
                } finally {
                    setIsSearching(false)
                }
            } else {
                setSearchResults([])
            }
        }

        performSearch()
    }, [searchQuery])

    // Get popular products (first 6 visible products)
    const popularProducts = products.slice(0, 6)

    // Show search results if searching
    const displayProducts = searchQuery ? searchResults : popularProducts

    return (
        <div className="home-page">
            {/* Hero Banner */}
            {!searchQuery && (
                <section className="hero-section">
                    <div className="hero-container">
                        <h2 className="hero-subtitle">
                            Welcome to
                        </h2>
                        <h1 className="hero-title">
                            Much Shop హాయ్ నా పెరు చేతన్
                        </h1>
                        <p className="hero-description">
                            Get your daily needs
                        </p>
                    </div>
                </section>
            )}

            <div className="home-content">
                {/* Categories Section */}
                {!searchQuery && (
                    <section className="categories-section">
                        <div className="categories-scroll scrollbar-hide">
                            {categories.map((category) => (
                                <CategoryBadge key={category} category={category} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Products Section */}
                <section className="products-section">
                    <h3 className="section-title">
                        {searchQuery
                            ? `Search results for "${searchQuery}"`
                            : 'Popular Products'}
                    </h3>

                    {loading || isSearching ? (
                        <div className="products-grid">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="loading-skeleton"></div>
                            ))}
                        </div>
                    ) : displayProducts.length > 0 ? (
                        <div className="products-grid">
                            {displayProducts.map((product, index) => (
                                <div key={product.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <p className="empty-state-text">
                                {searchQuery
                                    ? 'No products found. Try a different search term.'
                                    : 'No products available yet.'}
                            </p>
                        </div>
                    )}
                </section>

                {/* Quick Info */}
                {!searchQuery && (
                    <section className="quick-info-section">
                        <div className="info-card">
                            <div className="info-icon">🚚</div>
                            <h4 className="info-title">Fast Delivery</h4>
                            <p className="info-description">Same day delivery available</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">✅</div>
                            <h4 className="info-title">Fresh Quality</h4>
                            <p className="info-description">100% fresh guarantee</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">💬</div>
                            <h4 className="info-title">Easy Ordering</h4>
                            <p className="info-description">Order via WhatsApp</p>
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

export default Home
