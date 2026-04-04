import { Suspense } from "react";
import ItemsPageClient from "./ItemsPageClient";

export default function ItemsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-bg text-text" />}>
            <ItemsPageClient />
        </Suspense>
    );
}
