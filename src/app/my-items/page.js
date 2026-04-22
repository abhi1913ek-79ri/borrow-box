import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import MyItemsPageClient from "@/components/MyItemsPageClient";

export default async function MyItemsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    return <MyItemsPageClient />;
}