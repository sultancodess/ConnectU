import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notification) => {
        const id = Date.now();
        const newNotification = {
            id,
            type: notification.type || 'info', // success, error, warning, info
            title: notification.title,
            message: notification.message,
            duration: notification.duration || 5000
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto remove notification after duration
        setTimeout(() => {
            removeNotification(id);
        }, newNotification.duration);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const showSuccess = (title, message) => {
        addNotification({ type: 'success', title, message });
    };

    const showError = (title, message) => {
        addNotification({ type: 'error', title, message });
    };

    const showWarning = (title, message) => {
        addNotification({ type: 'warning', title, message });
    };

    const showInfo = (title, message) => {
        addNotification({ type: 'info', title, message });
    };

    const value = {
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
};

// Notification Container Component
const NotificationContainer = () => {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-50 space-y-2">
            {notifications.map(notification => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );
};

// Individual Notification Item
const NotificationItem = ({ notification, onClose }) => {
    const getNotificationStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    return (
        <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getNotificationStyles(notification.type)} animate-slide-in`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <span className="text-lg">{getIcon(notification.type)}</span>
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium">
                        {notification.title}
                    </p>
                    {notification.message && (
                        <p className="mt-1 text-sm opacity-90">
                            {notification.message}
                        </p>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={onClose}
                        className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationContext;