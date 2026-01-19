import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import CategoryBadge from '../components/CategoryBadge'
import { fetchProducts, getCategories, searchProducts } from '../services/productsService'

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
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Banner */}
            {!searchQuery && (
                <section className="bg-cream-100 px-4 py-10 mb-6 rounded-b-3xl shadow-soft animate-fade-in">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl font-bold text-text-primary mb-2">
                            Welcome to
                        </h2>
                        <h1 className="text-4xl font-extrabold text-text-primary mb-3">
                            Much Shop హాయ్ నా పెరు చేతన్
                        </h1>
                        <p className="text-text-secondary text-base">
                            Get your daily needs
                        </p>
                    </div>
                </section>
            )}

            <div className="max-w-7xl mx-auto px-4 pb-6">
                {/* Categories Section */}
                {!searchQuery && (
                    <section className="mb-8">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                            {categories.map((category) => (
                                <CategoryBadge key={category} category={category} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Products Section */}
                <section>
                    <h3 className="text-lg font-bold text-text-primary mb-4">
                        {searchQuery
                            ? `Search results for "${searchQuery}"`
                            : 'Popular Products'}
                    </h3>

                    {loading || isSearching ? (
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-cream-100 rounded-2xl h-80 skeleton"></div>
                            ))}
                        </div>
                    ) : displayProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {displayProducts.map((product, index) => (
                                <div key={product.id} style={{ animationDelay: `${index * 50}ms` }}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 animate-fade-in">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-text-secondary">
                                {searchQuery
                                    ? 'No products found. Try a different search term.'
                                    : 'No products available yet.'}
                            </p>
                        </div>
                    )}
                </section>

                {/* Quick Info */}
                {!searchQuery && (
                    <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                        <div className="text-center p-5 bg-cream-100 rounded-2xl shadow-soft hover:shadow-card transition-all duration-300">
                            <div className="text-4xl mb-3">🚚</div>
                            <h4 className="font-bold text-text-primary mb-1">Fast Delivery</h4>
                            <p className="text-sm text-text-secondary">Same day delivery available</p>
                        </div>
                        <div className="text-center p-5 bg-cream-100 rounded-2xl shadow-soft hover:shadow-card transition-all duration-300">
                            <div className="text-4xl mb-3">✅</div>
                            <h4 className="font-bold text-text-primary mb-1">Fresh Quality</h4>
                            <p className="text-sm text-text-secondary">100% fresh guarantee</p>
                        </div>
                        <div className="text-center p-5 bg-cream-100 rounded-2xl shadow-soft hover:shadow-card transition-all duration-300">
                            <div className="text-4xl mb-3">💬</div>
                            <h4 className="font-bold text-text-primary mb-1">Easy Ordering</h4>
                            <p className="text-sm text-text-secondary">Order via WhatsApp</p>
                        </div>
                    </section>
                )}
            </div>

            {/* Custom scrollbar hide */}
            <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    )
}

export default Home
