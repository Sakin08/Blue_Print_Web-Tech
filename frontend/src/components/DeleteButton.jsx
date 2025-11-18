import { Trash2 } from 'lucide-react';
import { canDelete } from '../utils/permissions';

const DeleteButton = ({
    currentUser,
    contentOwner,
    onDelete,
    itemName = 'item',
    className = '',
    size = 'md'
}) => {
    // Debug logging BEFORE calling canDelete
    console.log('=== DeleteButton Render ===');
    console.log('currentUser:', currentUser);
    console.log('contentOwner:', contentOwner);

    const canDeleteItem = canDelete(currentUser, contentOwner);

    console.log('canDeleteItem result:', canDeleteItem);
    console.log('=========================');

    if (!canDeleteItem) {
        return null;
    }

    const handleDelete = () => {
        console.log('DeleteButton clicked');
        if (window.confirm(`Are you sure you want to delete this ${itemName}?`)) {
            console.log('User confirmed deletion, calling onDelete');
            onDelete();
        } else {
            console.log('User cancelled deletion');
        }
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <button
            onClick={handleDelete}
            className={`flex items-center gap-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium ${sizeClasses[size]} ${className}`}
            title={`Delete ${itemName}`}
        >
            <Trash2 className={iconSizes[size]} />
            Delete
        </button>
    );
};

export default DeleteButton;
