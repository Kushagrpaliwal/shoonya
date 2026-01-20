"use client";
import { RefreshCw } from "lucide-react";
import { Button } from "./button";
import { useState } from "react";

export function RefreshButton({ onRefresh, className = "" }) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        } else {
            // Default behavior: reload the page
            window.location.reload();
        }
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className={`h-9 w-9 p-0 ${className}`}
            disabled={isRefreshing}
            title="Refresh data"
        >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
    );
}
