import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import WalletPageClient from "@/components/WalletPageClient";

export default async function WalletPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    return <WalletPageClient />;
}
