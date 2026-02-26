import { useState, useEffect } from 'react'
import { IoClose, IoCloudUpload, IoTrash } from 'react-icons/io5'
import { uploadCategoryImage } from '../../services/categoriesService'
import './CategoryFormModal.css'

function CategoryFormModal({ isOpen, onClose, onSubmit, editingCategory = null }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        image: '',
        color: '#e0f2fe',
        slug: ''
    })
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const [uploadProgress, setUploadProgress] = useState(0)

    // Reset or populate form when opening
    useEffect(() => {
        if (isOpen) {
            if (editingCategory) {
                setFormData({
                    name: editingCategory.name || '',
                    description: editingCategory.description || '',
                    icon: editingCategory.icon || '',
                    image: editingCategory.image || '',
                    color: editingCategory.color || '#e0f2fe',
                    slug: editingCategory.slug || ''
                })
                setImagePreview(editingCategory.image || '')
            } else {
                setFormData({
                    name: '',
                    description: '',
                    icon: '📦',
                    image: '',
                    color: '#e0f2fe',
                    slug: ''
                })
                setImagePreview('')
            }
            setImageFile(null)
            setUploadProgress(0)
        }
    }, [isOpen, editingCategory])

    const handleChange = (e) => {
        const { name, value } = e.target

        // Auto-generate slug from name if not editing
        if (name === 'name' && !editingCategory) {
            setFormData(prev => ({
                ...prev,
                name: value,
                slug: value.toLowerCase().replace(/\s+/g, '-')
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file')
                return
            }

            // Validate file size (max 5MB for Cloudinary)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB')
                return
            }

            setImageFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setImageFile(null)
        setImagePreview('')
        setFormData(prev => ({ ...prev, image: '' }))
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setUploadProgress(0)

        try {
            let imageUrl = formData.image // Keep existing image URL if no new file

            // Upload new image to Cloudinary if selected
            if (imageFile) {
                setUploadProgress(10)
                console.log('Uploading category image to Cloudinary...')
                imageUrl = await uploadCategoryImage(imageFile, editingCategory?.id)
                console.log('Category image uploaded:', imageUrl)
                setUploadProgress(100)
            }

            const dataToSubmit = {
                ...formData,
                image: imageUrl || ''
            }

            await onSubmit(dataToSubmit)
            onClose()
        } catch (error) {
            console.error('Error submitting form:', error)
            alert('Failed to save category. Please try again.')
        } finally {
            setLoading(false)
            setUploadProgress(0)
        }
    }


    if (!isOpen) return null

    return (
        <div className="modal-overlay">
            <div className="modal-content category-modal">
                <div className="modal-header">
                    <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <IoClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="category-form">
                    {/* Image Upload Section - TOP OF FORM */}
                    <div className="form-group">
                        <label>Category Image</label>
                        <div className="image-upload-section">
                            {imagePreview ? (
                                <div className="image-preview-container">
                                    <img
                                        src={imagePreview}
                                        alt="Category preview"
                                        className="category-image-preview"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="remove-image-btn"
                                        title="Remove image"
                                    >
                                        <IoTrash size={18} />
                                    </button>
                                </div>
                            ) : (
                                <label className="image-upload-label">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="image-input-hidden"
                                    />
                                    <div className="upload-placeholder">
                                        <IoCloudUpload size={32} />
                                        <span>Click to upload image</span>
                                        <small>PNG, JPG up to 5MB</small>
                                    </div>
                                </label>
                            )}
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="upload-progress">
                                <div
                                    className="upload-progress-bar"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Category Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Fresh Fruits"
                        />
                    </div>

                    <div className="form-group">
                        <label>Icon (Emoji) - Fallback</label>
                        <input
                            type="text"
                            name="icon"
                            value={formData.icon}
                            onChange={handleChange}
                            placeholder="e.g. 🍎"
                            maxLength={2}
                            className="emoji-input"
                        />
                        <small className="form-hint">Used when no image is uploaded</small>
                    </div>

                    <div className="form-group">
                        <label>Color Theme</label>
                        <div className="color-picker-wrapper">
                            <input
                                type="color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                            />
                            <span className="color-value">{formData.color}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Short description for this category..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CategoryFormModal
