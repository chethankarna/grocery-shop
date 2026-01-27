import { useState } from 'react';
import { getNextStatuses, isValidStatusTransition } from '../../services/ordersService';
import '../admin/AdminOrders.css';

function OrderStatusControls({ currentStatus, onStatusUpdate }) {
    const [updating, setUpdating] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);

    const nextStatuses = getNextStatuses(currentStatus);

    const handleStatusClick = (newStatus) => {
        // Show confirmation for CANCELLED
        if (newStatus === 'CANCELLED') {
            setPendingStatus(newStatus);
            setShowConfirmModal(true);
        } else {
            updateStatus(newStatus);
        }
    };

    const updateStatus = async (newStatus) => {
        setUpdating(true);
        setShowConfirmModal(false);

        try {
            await onStatusUpdate(newStatus);
            // Success - parent component will handle UI update via realtime listener
        } catch (error) {
            alert('Failed to update status: ' + error.message);
        } finally {
            setUpdating(false);
            setPendingStatus(null);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PROCESSING': 'Mark as Processing',
            'COMPLETED': 'Mark as Completed',
            'CANCELLED': 'Cancel Order'
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status) => {
        const icons = {
            'PROCESSING': '⏳',
            'COMPLETED': '✅',
            'CANCELLED': '❌'
        };
        return icons[status] || '';
    };

    if (nextStatuses.length === 0) {
        return (
            <div className="status-final">
                <p>This order is in a final state ({currentStatus})</p>
            </div>
        );
    }

    return (
        <>
            <div className="current-status">
                <strong>Current Status:</strong>
                <span className="status-badge" style={{
                    backgroundColor: currentStatus === 'NEW' ? 'var(--primary)' :
                        currentStatus === 'PROCESSING' ? '#F59E0B' :
                            currentStatus === 'COMPLETED' ? '#059669' : '#EF4444',
                    marginLeft: '0.5rem'
                }}>
                    {currentStatus}
                </span>
            </div>

            <div className="status-controls">
                {nextStatuses.map(status => (
                    <button
                        key={status}
                        onClick={() => handleStatusClick(status)}
                        disabled={updating}
                        className={`btn-status ${status === 'CANCELLED' ? 'danger' : 'primary'}`}
                    >
                        {getStatusIcon(status)} {getStatusLabel(status)}
                    </button>
                ))}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Confirm Cancellation</h3>
                        <p className="modal-message">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="btn-secondary"
                            >
                                No, Keep Order
                            </button>
                            <button
                                onClick={() => updateStatus(pendingStatus)}
                                className="btn-status danger"
                            >
                                Yes, Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default OrderStatusControls;
