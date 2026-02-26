import { useState, useEffect } from 'react'
import { uploadProductImage } from '../services/productsService'
import './ProductFormModal.css'

function ProductFormModal({ isOpen, onClose, onSubmit, product = null, categories = [] }) {
    // Treat as edit mode only if product has an ID
    const isEditMode = !!(product && product.id)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        originalPrice: '',
        stock: '',
        image: '',
        visible: true
    })

    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [categoryImageFile, setCategoryImageFile] = useState(null)
    const [categoryImagePreview, setCategoryImagePreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                category: product.category || '',
                price: product.price || '',
                originalPrice: product.originalPrice || '',
                stock: product.stock || '',
                image: product.image || '',
                visible: product.visible !== undefined ? product.visible : true
            })
            setImagePreview(product.image || null)
            setCategoryImagePreview(product.categoryImage || null)
        } else {
            // Reset form for new product
            setFormData({
                name: '',
                description: '',
                category: '',
                price: '',
                originalPrice: '',
                stock: '',
                image: '',
                visible: true
            })
            setImagePreview(null)
            setImageFile(null)
            setCategoryImagePreview(null)
            setCategoryImageFile(null)
        }
        setError(null)
    }, [product, isOpen])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file')
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB')
                return
            }

            setImageFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
            setError(null)
        }
    }

    const handleCategoryImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file')
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Category image size should be less than 5MB')
                return
            }

            setCategoryImageFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setCategoryImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
            setError(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            // Validate required fields
            if (!formData.name.trim()) {
                throw new Error('Product name is required')
            }
            if (!formData.category.trim()) {
                throw new Error('Category is required')
            }
            if (!formData.price || parseFloat(formData.price) <= 0) {
                throw new Error('Valid price is required')
            }

            let imageUrl = formData.image || ''

            // Upload new image if selected
            if (imageFile) {
                console.log('Uploading product image...')
                imageUrl = await uploadProductImage(imageFile, product?.id)
                console.log('Product image uploaded:', imageUrl)
            }

            // Upload category image if selected
            let categoryImageUrl = ''
            if (categoryImageFile) {
                console.log('Uploading category image...')
                categoryImageUrl = await uploadProductImage(categoryImageFile, null)
                console.log('Category image uploaded:', categoryImageUrl)
            }

            // Prepare product data
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                category: formData.category.trim(),
                categoryImage: categoryImageUrl || '',
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                stock: parseInt(formData.stock) || 0,
                image: imageUrl,
                visible: formData.visible
            }

            await onSubmit(productData)
            onClose()
        } catch (err) {
            console.error('Error submitting product:', err)
            setError(err.message || 'Failed to save product')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="modal-close" onClick={onClose} disabled={loading}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="product-form">
                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="name">Product Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Classic Burger"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Product description..."
                                rows="3"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="categoryImage">Category Image (Optional)</label>
                            <input
                                type="file"
                                id="categoryImage"
                                accept="image/*"
                                onChange={handleCategoryImageChange}
                                disabled={loading}
                            />
                            {categoryImagePreview && (
                                <div className="image-preview">
                                    <img src={categoryImagePreview} alt="Category Preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category *</label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                placeholder="e.g., Burgers"
                                list="categories-list"
                                required
                                disabled={loading}
                            />
                            {categories.length > 0 && (
                                <datalist id="categories-list">
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="stock">Stock Quantity *</label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">Price (₹) *</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="originalPrice">Original Price (₹)</label>
                            <input
                                type="number"
                                id="originalPrice"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleInputChange}
                                placeholder="0.00 (optional)"
                                step="0.01"
                                min="0"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="image">Product Image</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                            />
                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="visible"
                                    checked={formData.visible}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                                <span>Visible in store</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProductFormModal
