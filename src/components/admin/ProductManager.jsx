import { useState, useEffect } from 'react'
import {
    listenProductsRealtime,
    addProduct,
    updateProduct,
    deleteProduct
} from '../../services/productsService'
import { listenCategoriesRealtime } from '../../services/categoriesService'
import ProductFormModal from '../ProductFormModal'
import './ProductManager.css'

function ProductManager() {
    // Data State
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    // Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [visibilityFilter, setVisibilityFilter] = useState('all') // 'all', 'visible', 'hidden'

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)

    // Data Fetching
    useEffect(() => {
        const unsubscribeProducts = listenProductsRealtime((fetchedProducts) => {
            setProducts(fetchedProducts)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching products:', error)
            setLoading(false)
        })

        const unsubscribeCategories = listenCategoriesRealtime((fetchedCategories) => {
            setCategories(fetchedCategories)
        })

        return () => {
            unsubscribeProducts()
            unsubscribeCategories()
        }
    }, [])

    // Derived Data
    const categoryNames = categories.map(c => c.name)

    // Filter products based on search, category, and visibility
    const filteredProducts = products.filter(product => {
        // Search filter
        const matchesSearch = searchQuery === '' ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase())

        // Category filter
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory

        // Visibility filter
        const matchesVisibility = visibilityFilter === 'all' ||
            (visibilityFilter === 'visible' && product.visible !== false) ||
            (visibilityFilter === 'hidden' && product.visible === false)

        return matchesSearch && matchesCategory && matchesVisibility
    })

    // Handlers
    const handleAddProduct = () => {
        setEditingProduct(null)
        setIsProductModalOpen(true)
    }

    const handleEditProduct = (product) => {
        setEditingProduct(product)
        setIsProductModalOpen(true)
    }

    const handleDeleteProduct = async (productId, imageUrl) => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return
        }

        try {
            await deleteProduct(productId, imageUrl)
            // Success feedback could be added here
        } catch (error) {
            console.error('Error deleting product:', error)
            alert('Failed to delete product. Please try again.')
        }
    }

    const handleToggleVisibility = async (product) => {
        try {
            await updateProduct(product.id, {
                ...product,
                visible: !product.visible
            })
        } catch (error) {
            console.error('Error toggling visibility:', error)
            alert('Failed to update product visibility.')
        }
    }

    const handleSubmitProduct = async (data) => {
        try {
            if (editingProduct && editingProduct.id) {
                await updateProduct(editingProduct.id, data)
            } else {
                await addProduct(data)
            }
            setIsProductModalOpen(false)
        } catch (error) {
            console.error('Error saving product:', error)
            throw error // Let the modal handle the error
        }
    }

    const handleClearSearch = () => {
        setSearchQuery('')
    }

    if (loading) {
        return (
            <div className="section-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="section-container">
            {/* Header */}
            <header className="product-manager-header">
                <div className="header-top">
                    <h2 className="section-title">Product Management</h2>
                    <button
                        className="btn btn--primary"
                        onClick={handleAddProduct}
                    >
                        <span>➕</span>
                        <span>Add Product</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    {/* Search Bar */}
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                className="clear-search-btn"
                                onClick={handleClearSearch}
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Categories</option>
                        {categoryNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>

                    {/* Visibility Filter */}
                    <select
                        value={visibilityFilter}
                        onChange={(e) => setVisibilityFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Products</option>
                        <option value="visible">Visible Only</option>
                        <option value="hidden">Hidden Only</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="stats-bar">
                    <span className="stat">
                        Total: <strong>{products.length}</strong>
                    </span>
                    <span className="stat">
                        Filtered: <strong>{filteredProducts.length}</strong>
                    </span>
                </div>
            </header>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No Products Found</h3>
                    <p>
                        {searchQuery || selectedCategory !== 'all' || visibilityFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by adding your first product'}
                    </p>
                    {!searchQuery && selectedCategory === 'all' && visibilityFilter === 'all' && (
                        <button className="btn btn--primary" onClick={handleAddProduct}>
                            Add Product
                        </button>
                    )}
                </div>
            ) : (
                <div className="products-grid">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className={`product-card ${product.visible === false ? 'hidden-product' : ''}`}
                        >
                            {/* Product Image */}
                            <div className="product-image-wrapper">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="product-image"
                                    />
                                ) : (
                                    <div className="product-image-placeholder">
                                        <span>📸</span>
                                    </div>
                                )}
                                {product.visible === false && (
                                    <div className="hidden-badge">Hidden</div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-category">{product.category}</p>

                                <div className="product-meta">
                                    <span className="product-price">₹{product.price}</span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="product-original-price">₹{product.originalPrice}</span>
                                    )}
                                </div>

                                <div className="product-stock">
                                    <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="product-actions">
                                <button
                                    className="action-btn edit-btn"
                                    onClick={() => handleEditProduct(product)}
                                    title="Edit product"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="action-btn visibility-btn"
                                    onClick={() => handleToggleVisibility(product)}
                                    title={product.visible !== false ? 'Hide product' : 'Show product'}
                                >
                                    {product.visible !== false ? '👁️' : '👁️‍🗨️'}
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDeleteProduct(product.id, product.image)}
                                    title="Delete product"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Product Form Modal */}
            <ProductFormModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={handleSubmitProduct}
                product={editingProduct}
                categories={categoryNames}
            />
        </div>
    )
}

export default ProductManager
