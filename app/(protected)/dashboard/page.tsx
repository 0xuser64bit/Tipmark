import { getEarningData } from "@/actions/getEarningData";
import { getSolPrice } from "@/actions/getSolPrice";
import getUserByEmail from "@/actions/getUserByEmail";
import { AccountMenu } from "@/components/account-menu";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Statement } from "@/components/statement";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Ledger" };

export default async function LedgerPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

  const [data, priceUsd, user] = await Promise.all([
    getEarningData({ userId: email }),
    getSolPrice(),
    getUserByEmail({ email }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav actions={<AccountMenu />} />
      <Statement
        data={data}
        priceUsd={priceUsd}
        username={user?.username?.toLowerCase() ?? null}
        displayName={user?.display_name ?? "Your page"}
        profileImage={user?.profile_image ?? ""}
      />
      <SiteFooter />
    </div>
  );
}
