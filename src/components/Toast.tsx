import React, { useState, useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
                <span>{type === 'success' ? '✓' : '✕'}</span>
                <span>{message}</span>
            </div>
        </div>
    );
}

interface ToastContainerProps {
    children: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
    return <>{children}</>;
}

export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    const ToastComponent = toast ? (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    ) : null;

    return { showToast, ToastComponent };
}
