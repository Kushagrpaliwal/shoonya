"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * ConfirmModal - Replacement for window.confirm()
 * Displays a confirmation dialog with confirm/cancel actions
 * 
 * Usage:
 * <ConfirmModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={() => handleConfirm()}
 *   title="Delete Order"
 *   message="Are you sure you want to delete this order?"
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   variant="danger" // danger | warning | default
 * />
 */
export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title = "Confirm",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    isLoading = false
}) {
    const confirmButtonStyles = {
        danger: "bg-red-600 hover:bg-red-700 text-white",
        warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
        default: "bg-gray-900 hover:bg-gray-800 text-white",
    };

    const variantIcons = {
        danger: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        ),
        warning: (
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        default: (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    const handleConfirm = () => {
        onConfirm?.();
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="sm:max-w-md w-[calc(100%-2rem)] mx-4 rounded-lg">
                <AlertDialogHeader className="flex flex-col items-center text-center gap-2">
                    <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        {variantIcons[variant]}
                    </div>
                    <AlertDialogTitle className="text-gray-900">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
                    <AlertDialogCancel
                        onClick={onClose}
                        className="w-full sm:w-auto min-h-[44px] border-gray-300 hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={`w-full sm:w-auto min-h-[44px] ${confirmButtonStyles[variant]}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </span>
                        ) : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default ConfirmModal;
