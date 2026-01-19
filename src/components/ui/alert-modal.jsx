"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * AlertModal - Replacement for window.alert()
 * Displays success, error, warning, or info messages
 * 
 * Usage:
 * <AlertModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Success"
 *   message="Operation completed successfully"
 *   variant="success" // success | error | warning | info
 * />
 */
export function AlertModal({
    open,
    onClose,
    title = "Alert",
    message,
    variant = "info"
}) {
    const variantStyles = {
        success: "text-green-600",
        error: "text-red-600",
        warning: "text-yellow-600",
        info: "text-gray-900",
    };

    const variantIcons = {
        success: (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        warning: (
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        info: (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="sm:max-w-md w-[calc(100%-2rem)] mx-4 rounded-lg">
                <AlertDialogHeader className="flex flex-col items-center text-center gap-2">
                    <div className="p-3 rounded-full bg-gray-100">
                        {variantIcons[variant]}
                    </div>
                    <AlertDialogTitle className={variantStyles[variant]}>
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogAction
                        onClick={onClose}
                        className="w-full sm:w-auto min-h-[44px] bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default AlertModal;
