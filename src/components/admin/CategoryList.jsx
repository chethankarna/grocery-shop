import { IoAdd, IoPencil, IoTrash, IoSync } from 'react-icons/io5'
import './CategoryList.css'

function CategoryList({ categories, onAdd, onEdit, onDelete, onSelect, onSync }) {
    return (
        <div className="category-list-view">
            {/* Header Actions */}
            <div className="view-header">
                <h3>Categories ({categories.length})</h3>
                <div className="header-actions">
                    {onSync && (
                        <button className="btn-secondary" onClick={onSync} title="Sync categories from existing products">
                            <IoSync size={16} />
                            <span>Sync from Products</span>
                        </button>
                    )}
                    <button className="btn-primary" onClick={onAdd}>
                        <IoAdd size={18} />
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="admin-category-grid">
                {categories.map(category => (
                    <div
                        key={category.id}
                        className="admin-category-card"
                        onClick={() => onSelect(category)} // Drill down
                    >
                        <div
                            className="card-icon-wrapper"
                            style={{ backgroundColor: category.color || '#f3f4f6' }}
                        >
                            <span className="card-icon">{category.icon || '📦'}</span>
                        </div>

                        <div className="card-details">
                            <h4 className="card-title">{category.name}</h4>
                            <span className="product-count">
                                {category.productCount || 0} products
                            </span>
                        </div>

                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="action-btn edit"
                                onClick={() => onEdit(category)}
                                title="Edit Category"
                            >
                                <IoPencil size={16} />
                            </button>
                            <button
                                className="action-btn delete"
                                onClick={() => onDelete(category)}
                                title="Delete Category"
                            >
                                <IoTrash size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="empty-categories">
                    <p>No categories found. Create your first one!</p>
                </div>
            )}
        </div>
    )
}

export default CategoryList
